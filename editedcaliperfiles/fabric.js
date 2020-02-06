/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const FabricClient = require('fabric-client');
var Graph = require("@dagrejs/graphlib").Graph;
var graphlib = require("@dagrejs/graphlib");

//const { TopologicalSort } = require('topological-sort');
const Version = require('../../comm/version.js');
const FabricNetwork = require('./fabricNetwork.js');
const util = require('../../comm/util.js');
const TxStatus = require('../../comm/transaction.js');
const BlockchainInterface = require('../../comm/blockchain-interface.js');

const fs = require('fs');
const child_process = require('child_process');
const tmp = require('tmp');

const logger = util.getLogger('adapters/fabric-ccp');
const config = require('../../comm/config-util.js').getConfig();

var g = new Graph();
let broadcasterrorfailures = 0;
let totalSuccTransactions = 0;
let totalFailedTransactions = 0;
let totalmvccFailures = 0;
let totalintraBlockFailures = 0;
let totalirresolvableFailures = 0;
let otherfailurescode = new Array();
let totalEndorsementFailures = 0;
let totalPhantomReads = 0;
let totalOtherFailures = 0;



//const sortOp = new TopologicalSort();
//const nodes = new Map();
//nodes.set('A', 100);
//nodes.set('B', 2);
//const sortOp = new TopologicalSort(nodes);

//let totalEndorsementFailures = 0;

//////////////////////
// TYPE DEFINITIONS //
//////////////////////

/**
 * @typedef {Object} EventSource
 *
 * @property {string[]} channel The list of channels this event source listens on. Only meaningful for Fabric v1.0.
 * @property {string} peer The name of the peer the event source connects to.
 * @property {EventHub|ChannelEventHub} eventHub The event hub object representing the connection.
 */

/**
 * @typedef {Object} ChaincodeInvokeSettings
 *
 * @property {string} chaincodeId Required. The name/ID of the chaincode whose function
 *           should be invoked.
 * @property {string} chaincodeVersion Required. The version of the chaincode whose function
 *           should be invoked.
 * @property {string} chaincodeFunction Required. The name of the function that should be
 *           invoked in the chaincode.
 * @property {string[]} chaincodeArguments Optional. The list of {string} arguments that should
 *           be passed to the chaincode.
 * @property {Map<string, Buffer>} transientMap Optional. The transient map that should be
 *           passed to the chaincode.
 * @property {string} invokerIdentity Required. The name of the client who should invoke the
 *           chaincode. If an admin is needed, use the organization name prefixed with a # symbol.
 * @property {string} channel Required. The name of the channel whose chaincode should be invoked.
 * @property {string[]} targetPeers Optional. An array of endorsing
 *           peer names as the targets of the invoke. When this
 *           parameter is omitted the target list will include the endorsing peers assigned
 *           to the target chaincode, or if it is also omitted, to the channel.
 * @property {string} orderer Optional. The name of the orderer to whom the request should
 *           be submitted. If omitted, then the first orderer node of the channel will be used.
 */

/**
 * @typedef {Object} ChaincodeQuerySettings
 *
 * @property {string} chaincodeId Required. The name/ID of the chaincode whose function
 *           should be invoked.
 * @property {string} chaincodeVersion Required. The version of the chaincode whose function
 *           should be invoked.
 * @property {string} chaincodeFunction Required. The name of the function that should be
 *           invoked in the chaincode.
 * @property {string[]} chaincodeArguments Optional. The list of {string} arguments that should
 *           be passed to the chaincode.
 * @property {Map<string, Buffer>} transientMap Optional. The transient map that should be
 *           passed to the chaincode.
 * @property {string} invokerIdentity Required. The name of the client who should invoke the
 *           chaincode. If an admin is needed, use the organization name prefixed with a # symbol.
 * @property {string} channel Required. The name of the channel whose chaincode should be invoked.
 * @property {string[]} targetPeers Optional. An array of endorsing
 *           peer names as the targets of the invoke. When this
 *           parameter is omitted the target list will include the endorsing peers assigned
 *           to the target chaincode, or if it is also omitted, to the channel.
 * @property {boolean} countAsLoad Optional. Indicates whether to count this query as workload.
 */

/////////////////////////////
// END OF TYPE DEFINITIONS //
/////////////////////////////

/**
 * Implements {BlockchainInterface} for a Fabric backend, utilizing the SDK's Common Connection Profile.
 *
 * @property {Version} version Contains the version information about the used Fabric SDK.
 * @property {Map<string, FabricClient>} clientProfiles Contains the initialized and user-specific SDK client profiles
 *           for each defined user. Maps the custom user names to the Client instances.
 * @property {Map<string, FabricClient>} adminProfiles Contains the initialized and admin-specific SDK client profiles
 *           for each defined admin. Maps the custom organization names to the Client instances
 *           (since only one admin per org is supported).
 * @property {Map<string, FabricClient>} registrarProfiles Contains the initialized and registrar-specific SDK client
 *           profiles for each defined registrar. Maps the custom organization names to the Client instances
 *           (since only one registrar per org is supported).
 * @property {EventSource[]} eventSources Collection of potential event sources to listen to for transaction confirmation events.
 * @property {number} clientIndex The index of the client process using the adapter that is set when calling @link{getContext}.
 * @property {number} txIndex A counter for keeping track of the index of the currently submitted transaction.
 * @property {FabricNetwork} networkUtil Utility object containing easy-to-query information about the topology
 *           and settings of the network.
 * @property {Map<string, Map<string, Map<string, string[]>>>} randomTargetPeerCache Contains the target peers of chaincodes
 *           grouped by channels and organizations: Channel -> Chaincode -> Org -> Peers
 * @property {Map<string, EventSource[]>} channelEventSourcesCache Contains the list of event sources for every channel.
 * @property {Map<string, string[]>} randomTargetOrdererCache Contains the list of target orderers of channels.
 * @property {string} defaultInvoker The name of the client to use if an invoker is not specified.
 * @property {number} configSmallestTimeout The timeout value to use when the user-provided timeout is too small.
 * @property {number} configSleepAfterCreateChannel The sleep duration in milliseconds after creating the channels.
 * @property {number} configSleepAfterJoinChannel The sleep duration in milliseconds after joining the channels.
 * @property {number} configSleepAfterInstantiateChaincode The sleep duration in milliseconds after instantiating the chaincodes.
 * @property {boolean} configVerifyProposalResponse Indicates whether to verify the proposal responses of the endorsers.
 * @property {boolean} configVerifyReadWriteSets Indicates whether to verify the matching of the returned read-write sets.
 * @property {number} configLatencyThreshold The network latency threshold to use for calculating the final commit time of transactions.
 * @property {boolean} configOverwriteGopath Indicates whether GOPATH should be set to the Caliper root directory.
 * @property {number} configChaincodeInstantiateTimeout The timeout in milliseconds for the chaincode instantiation endorsement.
 * @property {number} configChaincodeInstantiateEventTimeout The timeout in milliseconds for receiving the chaincode instantion event.
 * @property {number} configDefaultTimeout The default timeout in milliseconds to use for invoke/query transactions.
 * @property {string} configClientBasedLoadBalancing The value indicating the type of automatic load balancing to use.
 * @property {boolean} configCountQueryAsLoad Indicates whether queries should be counted as workload.
 */
class Fabric extends BlockchainInterface {
    /**
     * Initializes the Fabric adapter.
     * @param {string|object} networkConfig The relative or absolute file path, or the object itself of the Common Connection Profile settings.
     */
    constructor(networkConfig) {
        super(networkConfig);
        this.version = new Version(require('fabric-client/package').version);

        // NOTE: regardless of the version of the Fabric backend, the SDK must be at least v1.1.0 in order to
        // use the common connection profile feature
        if (this.version.lessThan('1.1.0')) {
            throw new Error(`Fabric SDK ${this.version.toString()} is not supported, use at least version 1.1.0`);
        }

	//this.totalEndorsementFailures = 0;
        this.clientProfiles = new Map();
        this.adminProfiles = new Map();
        this.registrarProfiles = new Map();
        this.eventSources = [];
        this.clientIndex = 0;
        this.txIndex = -1;
        this.networkUtil = new FabricNetwork(networkConfig);
        this.randomTargetPeerCache = new Map();
        this.channelEventSourcesCache = new Map();
        this.randomTargetOrdererCache = new Map();
        this.defaultInvoker = Array.from(this.networkUtil.getClients())[0];

        if (this.networkUtil.isInCompatibilityMode() && this.version.greaterThan('1.1.0')) {
            throw new Error(`Fabric 1.0 compatibility mode is detected, but SDK version ${this.version.toString()} is used`);
        }

        // this value is hardcoded, if it's used, that means that the provided timeouts are not sufficient
        this.configSmallestTimeout = 1000;
        //this.configSmallestTimeout = 300000;

        this.configSleepAfterCreateChannel = config.get('fabricCcp:sleepAfter:createChannel', 5000);
        this.configSleepAfterJoinChannel = config.get('fabricCcp:sleepAfter:joinChannel', 3000);
        this.configSleepAfterInstantiateChaincode = config.get('fabricCcp:sleepAfter:instantiateChaincode', 5000);
        //this.configVerifyProposalResponse = this._getBoolConfig('fabricCcp:verify:proposalResponse', true);
        this.configVerifyProposalResponse = true;
        //this.configVerifyReadWriteSets = this._getBoolConfig('fabricCcp:verify:readWriteSets', true);
        this.configVerifyReadWriteSets = false;
        this.configLatencyThreshold = config.get('fabricCcp:latencyThreshold', 1.0);
        this.configOverwriteGopath = this._getBoolConfig('fabricCcp:overwriteGopath', true);
        this.configChaincodeInstantiateTimeout = config.get('fabricCcp:timeout:chaincodeInstantiate', 10000);
        //this.configChaincodeInstantiateTimeout = 300000;
        this.configChaincodeInstantiateEventTimeout = config.get('fabricCcp:timeout:chaincodeInstantiateEvent', 300000);
        //this.configChaincodeInstantiateEventTimeout = 300000;
        //this.configDefaultTimeout = config.get('fabricCcp:timeout:invokeOrQuery', 60000);
        this.configDefaultTimeout = 120000;
        //this.configDefaultTimeout = 300000;
        this.configClientBasedLoadBalancing = config.get('fabricCcp:loadBalancing', 'client') === 'client';
        this.configCountQueryAsLoad = this._getBoolConfig('fabricCcp:countQueryAsLoad', true);

        this._prepareCaches();
    }

    ////////////////////////////////
    // INTERNAL UTILITY FUNCTIONS //
    ////////////////////////////////

    /**
     * Assembles the event sources based on explicitly given target peers.
     * @param {string} channel The name of channel containing the target peers. Doesn't matter if peer-level event service is used in compatibility mode.
     * @param {string[]} targetPeers The list of peers to connect to.
     * @return {EventSource[]} The list of event sources.
     * @private
     */
    _assembleTargetEventSources(channel, targetPeers) {
        let eventSources = [];
        if (this.networkUtil.isInCompatibilityMode()) {
            // NOTE: for old event hubs we have a single connection to every peer set as an event source
            const EventHub = require('fabric-client/lib/EventHub.js');

            for (let peer of targetPeers) {
                let org = this.networkUtil.getOrganizationOfPeer(peer);
                let admin = this.adminProfiles.get(org);

                let eventHub = new EventHub(admin);
                eventHub.setPeerAddr(this.networkUtil.getPeerEventUrl(peer),
                    this.networkUtil.getGrpcOptionsOfPeer(peer));

                eventSources.push({
                    channel: [channel], // unused during chaincode instantiation
                    peer: peer,
                    eventHub: eventHub
                });
            }
        } else {
            for (let peer of targetPeers) {
                let org = this.networkUtil.getOrganizationOfPeer(peer);
                let admin = this.adminProfiles.get(org);

                let eventHub = admin.getChannel(channel, true).newChannelEventHub(peer);

                eventSources.push({
                    channel: [channel], // unused during chaincode instantiation
                    peer: peer,
                    eventHub: eventHub
                });
            }
        }

        return eventSources;
    }

    /**
     * Assembles random target peers for the channel from every organization that has the chaincode deployed.
     * @param {string} channel The name of the channel.
     * @param {string} chaincodeId The name/ID of the chaincode.
     * @param {string} chaincodeVersion The version of the chaincode.
     * @returns {string[]} Array containing a random peer from each needed organization.
     * @private
     */
    _assembleRandomTargetPeers(channel, chaincodeId, chaincodeVersion) {
        let targets = [];
        let chaincodeOrgs = this.randomTargetPeerCache.get(channel).get(`${chaincodeId}@${chaincodeVersion}`);

        for (let entries of chaincodeOrgs.entries()) {
            let peers = entries[1];

            // represents the load balancing mechanism
            let loadBalancingCounter = this.configClientBasedLoadBalancing ? this.clientIndex : this.txIndex;
            targets.push(peers[loadBalancingCounter % peers.length]);
        }

        return targets;
    }

    /**
     * Creates the specified channels if necessary.
     * @return {boolean} True, if at least one channel was created. Otherwise, false.
     * @private
     * @async
     */
    async _createChannels() {
        let channels = this.networkUtil.getChannels();
        let channelCreated = false;

        for (let channel of channels) {
            let channelObject = this.networkUtil.getNetworkObject().channels[channel];

            if (util.checkProperty(channelObject, 'created') && channelObject.created) {
                logger.info(`${channel} is configured as created, skipping it`);
                continue;
            }

            channelCreated = true;

            let configUpdate;
            if (util.checkProperty(channelObject, 'configBinary')) {
                configUpdate = this._getChannelConfigFromFile(channelObject, channel);
            }
            else {
                configUpdate = this._getChannelConfigFromConfiguration(channelObject, channel);
            }

            // NOTE: without knowing the system channel policies, signing with every org admin is a safe bet
            let orgs = this.networkUtil.getOrganizationsOfChannel(channel);
            let admin; // declared here to keep the admin of the last org of the channel
            let signatures = [];
            for (let org of orgs) {
                admin = this.adminProfiles.get(org);
                try {
                    signatures.push(admin.signChannelConfig(configUpdate));
                } catch (err) {
                    throw new Error(`${org}'s admin couldn't sign the configuration update of ${channel}: ${err.message}`);
                }
            }

            let txId = admin.newTransactionID(true);
            let request = {
                config: configUpdate,
                signatures: signatures,
                name: channel,
                txId: txId
            };

            try {
                /** @link{BroadcastResponse} */
                let broadcastResponse = await admin.createChannel(request);

                util.assertDefined(broadcastResponse, `The returned broadcast response for creating ${channel} is undefined`);
                util.assertProperty(broadcastResponse, 'broadcastResponse', 'status');

                if (broadcastResponse.status !== 'SUCCESS') {
                    throw new Error(`Orderer response indicated unsuccessful ${channel} creation: ${broadcastResponse.status}`);
                }
            } catch (err) {
                throw new Error(`Couldn't create ${channel}: ${err.message}`);
            }

            logger.info(`${channel} successfully created`);
        }

        return channelCreated;
    }

    /**
     *
     * @param {EventSource} eventSource The event source to use for registering the Tx event.
     * @param {string} txId The transaction ID.
     * @param {TxStatus} invokeStatus The transaction status object.
     * @param {number} startTime The epoch of the transaction start time.
     * @param {number} timeout The timeout for the transaction life-cycle.
     * @return {Promise<{successful: boolean, message: string, time: number}>} The details of the event notification.
     * @private
     */
    _createEventRegistrationPromise(eventSource, txId, invokeStatus, startTime, timeout) {
        return new Promise(resolve => {
            let handle = setTimeout(() => {
                // give the other event hub connections a chance
                // to verify the Tx status, so resolve the promise

                eventSource.eventHub.unregisterTxEvent(txId);

                let time = Date.now();
                invokeStatus.Set(`commit_timeout_${eventSource.peer}`, 'TIMEOUT');
                //invokeStatus.Set('commit_timeout_occured', true);
                //invokeStatus.Set('commit_timeout_failures', committimeoutfailures);

                // resolve the failed transaction with the current time and error message
                resolve({
                    successful: false,
                    message: `Commit timeout on ${eventSource.peer}`,
                    time: time
                });
//            }, this._getRemainingTimeout(startTime, timeout));
            },900000); 

            eventSource.eventHub.registerTxEvent(txId, (tx, code) => {
                //clearTimeout(handle);
                let time = Date.now();
                eventSource.eventHub.unregisterTxEvent(txId);

                // either explicit invalid event or valid event, verified in both cases by at least one peer
                // TODO: what about when a transient error occurred on a peer?
                invokeStatus.SetVerification(true);

                if (code !== 'VALID') {
                    invokeStatus.Set(`commit_error_${eventSource.peer}`, code);
                    //invokeStatus.Set('commit_fail_time', Date.now()-startTime);
                    //invokeStatus.Set('commit_fail_code', code);

                    resolve({
                        successful: false,
                        message: `Commit error on ${eventSource.peer} with code ${code}`,
                        time: time
                    });
                } else {
                    invokeStatus.Set(`commit_success_${eventSource.peer}`, time);
                    //invokeStatus.Set('commit_success_time', Date.now()-startTime);
	            //invokeStatus.Set('commit_timeout_occured', false);
                    resolve({
                        successful: true,
                        message: 'undefined',
                        time: time
                    });
                }
            }, (err) => {
                //clearTimeout(handle);
                eventSource.eventHub.unregisterTxEvent(txId);
                let time = Date.now();

                // we don't know what happened, but give the other event hub connections a chance
                // to verify the Tx status, so resolve this promise
                invokeStatus.Set(`event_hub_error_${eventSource.peer}`, err.message);

                resolve({
                    successful: false,
                    message: `Event hub error on ${eventSource.peer}: ${err.message}`,
                    time: time
                });
            });
        });
    }

    /**
     * Creates and sets a User object as the context based on the provided identity information.
     * @param {Client} profile The Client object whose user context must be set.
     * @param {string} org The name of the user's organization.
     * @param {string} userName The name of the user.
     * @param {{privateKeyPEM: Buffer, signedCertPEM: Buffer}} cryptoContent The object containing the signing key and cert in PEM format.
     * @param {string} profileName Optional name of the profile that will appear in error messages.
     * @private
     * @async
     */
    async _createUser(profile, org, userName, cryptoContent, profileName) {
        // set the user explicitly based on its crypto materials
        // createUser also sets the user context
        try {
            await profile.createUser({
                username: userName,
                mspid: this.networkUtil.getMspIdOfOrganization(org),
                cryptoContent: cryptoContent,
                skipPersistence: false
            });
        } catch (err) {
            throw new Error(`Couldn't create ${profileName || ''} user object: ${err.message}`);
        }
    }

    /**
     * Enrolls the given user through its corresponding CA.
     * @param {Client} profile The Client object whose user must be enrolled.
     * @param {string} id The enrollment ID.
     * @param {string} secret The enrollment secret.
     * @param {string} profileName Optional name of the profile that will appear in error messages.
     * @return {Promise<{key: ECDSA_KEY, certificate: string}>} The resulting private key and certificate.
     * @private
     * @async
     */
    async _enrollUser(profile, id, secret, profileName) {
        // this call will throw an error if the CA configuration is not found
        // this error should propagate up
        let ca = profile.getCertificateAuthority();
        try {
            return await ca.enroll({
                enrollmentID: id,
                enrollmentSecret: secret
            });
        } catch (err) {
            throw new Error(`Couldn't enroll ${profileName || 'user'}: ${err.message}`);
        }
    }

    /**
     * Retrieves a bool argument from the configuration store, taking into account the bool parsing behavior.
     * @param {string} key The key of the configuration to retrieve.
     * @param {object} defaultValue The default value to return if the configuration is not found.
     * @return {boolean} The retrieved value of the configuration as true of false. (Instead of 'true' of 'false'.)
     * @private
     */
    _getBoolConfig(key, defaultValue) {
        let val = config.get(key, defaultValue);
        return val === true || val === 'true';
    }

    /**
     * Extracts the channel configuration directly from the configuration.
     * @param {object} channelObject The channel configuration object.
     * @param {string} channelName The name of the channel.
     * @return {Buffer} The extracted channel configuration bytes.
     * @private
     */
    _getChannelConfigFromConfiguration(channelObject, channelName) {
        // spawn a configtxlator process and encode the config object through a temporary file
        // NOTES:
        // 1) there doesn't seem to be a straightforward SDK API for this
        // 2) sync is okay in Caliper initialization phase
        // 3) for some reason configtxlator cannot open /dev/stdin and stdout when buffers are attached to them
        // so temporary files have to be used
        // ./configtxlator proto_encode --type=common.ConfigUpdate --input=tmpInputFile --output=tmpOutputFile
        let binaryPath = util.resolvePath(channelObject.configtxlatorPath);
        let tmpInputFile = null;
        let tmpOutputFile = null;
        try {
            tmpInputFile = tmp.tmpNameSync();
            tmpOutputFile = tmp.tmpNameSync();
            fs.writeFileSync(tmpInputFile, JSON.stringify(channelObject.configUpdateObject));
            let result = child_process.spawnSync(binaryPath, ['proto_encode', '--type=common.ConfigUpdate', `--output=${tmpOutputFile}`, `--input=${tmpInputFile}`]);
            if (result.error) {
                throw new Error(`Couldn't encode ${channelName} config update: ${result.error.message}`);
            }

            if (result.status !== 0) {
                let stderr = Buffer.from(result.stderr, 'utf-8').toString();
                let stdout = Buffer.from(result.stdout, 'utf-8').toString();
                logger.error(`configtxlator stderr output:\n${stderr}`);
                logger.error(`configtxlator stdout output:\n${stdout}`);
                throw new Error(`Couldn't encode ${channelName} config update: exit status is ${result.status}`);
            }

            return fs.readFileSync(tmpOutputFile);
        } catch (err) {
            throw err;
        } finally {
            if (tmpInputFile && fs.existsSync(tmpInputFile)) {
                fs.unlinkSync(tmpInputFile);
            }
            if (tmpOutputFile && fs.existsSync(tmpOutputFile)) {
                fs.unlinkSync(tmpOutputFile);
            }
        }
    }

    /**
     * Extracts the channel configuration from the configured file.
     * @param {object} channelObject The channel configuration object.
     * @param {string} channelName The name of the channel.
     * @return {Buffer} The extracted channel configuration bytes.
     * @private
     */
    _getChannelConfigFromFile(channelObject, channelName) {
        // extracting the config from the binary file
        let binaryPath = util.resolvePath(channelObject.configBinary);
        let envelopeBytes;

        try {
            envelopeBytes = fs.readFileSync(binaryPath);
        } catch (err) {
            throw new Error(`Couldn't read configuration binary for ${channelName}: ${err.message}`);
        }

        try {
            return new FabricClient().extractChannelConfig(envelopeBytes);
        } catch (err) {
            throw new Error(`Couldn't extract configuration object for ${channelName}: ${err.message}`);
        }
    }

    /**
     * Gets a random target orderer for the given channel.
     * @param {string} channel The name of the channel.
     * @return {string} The name of the target orderer.
     * @private
     */
    _getRandomTargetOrderer(channel) {
        let orderers = this.randomTargetOrdererCache.get(channel);

        // represents the load balancing mechanism
        let loadBalancingCounter = this.configClientBasedLoadBalancing ? this.clientIndex : this.txIndex;

        return orderers[loadBalancingCounter % orderers.length];
    }

    /**
     * Calculates the remaining time to timeout based on the original timeout and a starting time.
     * @param {number} start The epoch of the start time in ms.
     * @param {number} original The original timeout in ms.
     * @returns {number} The remaining time until the timeout in ms.
     * @private
     */
    _getRemainingTimeout(start, original) {
        let newTimeout = original - (Date.now() - start);
        if (newTimeout < this.configSmallestTimeout) {
            logger.warn(`Timeout is too small, default value of ${this.configSmallestTimeout}ms is used instead`);
            newTimeout = this.configSmallestTimeout;
        }

        return newTimeout;
    }

    /**
     * Checks whether the user materials are already persisted in the local store and sets the user context if found.
     * @param {Client} profile The Client object to fill with the User instance.
     * @param {string} userName The name of the user to check and load.
     * @param {string} profileName Optional name of the profile that will appear in error messages.
     * @return {Promise<User>} The loaded User object
     * @private
     * @async
     */
    async _getUserContext(profile, userName, profileName) {
        // Check whether the materials are already saved
        // getUserContext automatically sets the user if found
        try {
            return await profile.getUserContext(userName, true);
        } catch (err) {
            throw new Error(`Couldn't check whether ${profileName || 'the user'}'s materials are available locally: ${err.message}`);
        }
    }

    /**
     * Initializes the admins of the organizations.
     *
     * @param {boolean} initPhase Indicates whether to log admin init progress.
     * @private
     * @async
     */
    async _initializeAdmins(initPhase) {
        let orgs = this.networkUtil.getOrganizations();
        for (let org of orgs) {
            let adminName = `admin.${org}`;
            // build the common part of the profile
            let adminProfile = await this._prepareClientProfile(org, undefined, `${org}'s admin`);

            // check if the materials already exist locally
            let admin = await this._getUserContext(adminProfile, adminName, `${org}'s admin`);

            if (admin) {
                this.adminProfiles.set(org, adminProfile);

                if (this.networkUtil.isMutualTlsEnabled()) {
                    this._setTlsAdminCertAndKey(org);
                }

                if (initPhase) {
                    logger.warn(`${org}'s admin's materials found locally. Make sure it is the right one!`);
                }
                continue;
            }

            // set the admin explicitly based on its crypto materials
            await this._createUser(adminProfile, org, adminName, this.networkUtil.getAdminCryptoContentOfOrganization(org),
                `${org}'s admin`);

            this.adminProfiles.set(org, adminProfile);

            if (this.networkUtil.isMutualTlsEnabled()) {
                this._setTlsAdminCertAndKey(org);
            }

            logger.info(`${org}'s admin's materials are successfully loaded`);
        }
    }

    /**
     * Initializes the given channel of every client profile to be able to verify proposal responses.
     * @param {Map<string, FabricClient>} profiles The collection of client profiles.
     * @param {string} channel The name of the channel to initialize.
     * @private
     * @async
     */
    async _initializeChannel(profiles, channel) {
        // initialize the channel for every client profile from the local config
        for (let profile of profiles.entries()) {
            let ch = profile[1].getChannel(channel, false);
            if (ch) {
                try {
                    await ch.initialize();
                } catch (err) {
                    logger.error(`Couldn't initialize ${channel} for ${profile[0]}: ${err.message}`);
                    throw err;
                }
            }
        }
    }

    /**
     * Initializes the registrars of the organizations.
     *
     * @param {boolean} initPhase Indicates whether to log registrar init progress.
     * @private
     * @async
     */
    async _initializeRegistrars(initPhase) {
        let orgs = this.networkUtil.getOrganizations();
        for (let org of orgs) {

            // providing registrar information is optional and only needed for user registration and enrollment
            let registrarInfo = this.networkUtil.getRegistrarOfOrganization(org);
            if (!registrarInfo) {
                if (initPhase) {
                    logger.warn(`${org}'s registrar information not provided.`);
                }
                continue;
            }

            // build the common part of the profile
            let registrarProfile = await this._prepareClientProfile(org, undefined, 'registrar');
            // check if the materials already exist locally
            let registrar = await this._getUserContext(registrarProfile, registrarInfo.enrollId, `${org}'s registrar`);

            if (registrar) {
                if (initPhase) {
                    logger.warn(`${org}'s registrar's materials found locally. Make sure it is the right one!`);
                }
                this.registrarProfiles.set(org, registrarProfile);
                continue;
            }

            // set the registrar identity as the current user context
            await this._setUserContextByEnrollment(registrarProfile, registrarInfo.enrollId,
                registrarInfo.enrollSecret, `${org}'s registrar`);

            this.registrarProfiles.set(org, registrarProfile);
            if (initPhase) {
                logger.info(`${org}'s registrar enrolled successfully`);
            }
        }
    }

    /**
     * Registers and enrolls the specified users if necessary.
     *
     * @param {boolean} initPhase Indicates whether to log user init progress.
     * @private
     * @async
     */
    async _initializeUsers(initPhase) {
        let clients = this.networkUtil.getClients();

        // register and enroll each client with its organization's CA
        for (let client of clients) {
            let org = this.networkUtil.getOrganizationOfClient(client);

            // create the profile based on the connection profile
            let clientProfile = await this._prepareClientProfile(org, client, client);
            this.clientProfiles.set(client, clientProfile);

            // check if the materials already exist locally
            let user = await this._getUserContext(clientProfile, client, client);
            if (user) {
                if (this.networkUtil.isMutualTlsEnabled()) {
                    // "retrieve" and set the deserialized cert and key
                    clientProfile.setTlsClientCertAndKey(user.getIdentity()._certificate, user.getSigningIdentity()._signer._key.toBytes());
                }

                if (initPhase) {
                    logger.warn(`${client}'s materials found locally. Make sure it is the right one!`);
                }
                continue;
            }

            let cryptoContent = this.networkUtil.getClientCryptoContent(client);
            if (cryptoContent) {
                // the client is already enrolled, just create and persist the User object
                await this._createUser(clientProfile, org, client, cryptoContent, client);
                if (this.networkUtil.isMutualTlsEnabled()) {
                    // the materials are included in the configuration file
                    let crypto = this.networkUtil.getClientCryptoContent(client);
                    clientProfile.setTlsClientCertAndKey(crypto.signedCertPEM.toString(), crypto.privateKeyPEM.toString());
                }

                if (initPhase) {
                    logger.info(`${client}'s materials are successfully loaded`);
                }
                continue;
            }

            // The user needs to be enrolled or even registered

            // if the enrollment ID and secret is provided, then enroll the already registered user
            let enrollmentSecret = this.networkUtil.getClientEnrollmentSecret(client);
            if (enrollmentSecret) {
                let enrollment = await this._enrollUser(clientProfile, client, enrollmentSecret, client);

                // create the new user based on the retrieved materials
                await this._createUser(clientProfile, org, client,
                    {
                        privateKeyPEM: enrollment.key.toBytes(),
                        signedCertPEM: Buffer.from(enrollment.certificate)
                    }, client);

                if (this.networkUtil.isMutualTlsEnabled()) {
                    // set the received cert and key for mutual TLS
                    clientProfile.setTlsClientCertAndKey(Buffer.from(enrollment.certificate).toString(), enrollment.key.toString());
                }

                if (initPhase) {
                    logger.info(`${client} successfully enrolled`);
                }
                continue;
            }

            // Otherwise, register then enroll the user
            let secret;
            try {
                let registrarProfile = this.registrarProfiles.get(org);

                if (!registrarProfile) {
                    throw new Error(`Registrar identity is not provided for ${org}`);
                }

                let registrarInfo = this.networkUtil.getRegistrarOfOrganization(org);
                let registrar = await registrarProfile.getUserContext(registrarInfo.enrollId, true);
                // this call will throw an error if the CA configuration is not found
                // this error should propagate up
                let ca = clientProfile.getCertificateAuthority();
                let userAffiliation = this.networkUtil.getAffiliationOfUser(client);

                // if not in compatibility mode (i.e., at least SDK v1.1), check whether the affiliation is already registered or not
                if (!this.networkUtil.isInCompatibilityMode()) {
                    let affService = ca.newAffiliationService();
                    let affiliationExists = false;
                    try {
                        await affService.getOne(userAffiliation, registrar);
                        affiliationExists = true;
                    } catch (err) {
                        if (initPhase) {
                            logger.info(`${userAffiliation} affiliation doesn't exists`);
                        }
                    }

                    if (!affiliationExists) {
                        await affService.create({name: userAffiliation, force: true}, registrar);
                        if (initPhase) {
                            logger.info(`${userAffiliation} affiliation added`);
                        }
                    }
                }

                let attributes = this.networkUtil.getAttributesOfUser(client);
                attributes.push({name: 'hf.Registrar.Roles', value: 'client'});

                secret = await ca.register({
                    enrollmentID: client,
                    affiliation: userAffiliation,
                    role: 'client',
                    attrs: attributes
                }, registrar);
            } catch (err) {
                throw new Error(`Couldn't register ${client}: ${err.message}`);
            }

            if (initPhase) {
                logger.info(`${client} successfully registered`);
            }

            let enrollment = await this._enrollUser(clientProfile, client, secret, client);

            // create the new user based on the retrieved materials
            await this._createUser(clientProfile, org, client,
                {privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: Buffer.from(enrollment.certificate)}, client);

            if (this.networkUtil.isMutualTlsEnabled()) {
                // set the received cert and key for mutual TLS
                clientProfile.setTlsClientCertAndKey(Buffer.from(enrollment.certificate).toString(), enrollment.key.toString());
                //this._setTlsClientCertAndKey(client);
            }

            if (initPhase) {
                logger.info(`${client} successfully enrolled`);
            }
        }
    }

    /**
     * Install the specified chaincodes to their target peers.
     * @private
     * @async
     */
    async _installChaincodes() {
        if (this.configOverwriteGopath) {
            process.env.GOPATH = util.resolvePath('.');
        }

        let errors = [];

        let channels = this.networkUtil.getChannels();
        for (let channel of channels) {
            logger.info(`Installing chaincodes for ${channel}...`);

            // proceed cc by cc for the channel
            let chaincodeInfos = this.networkUtil.getChaincodesOfChannel(channel);
            for (let chaincodeInfo of chaincodeInfos) {
                let ccObject = this.networkUtil.getNetworkObject().channels[channel].chaincodes.find(
                    cc => cc.id === chaincodeInfo.id && cc.version === chaincodeInfo.version);

                let targetPeers = this.networkUtil.getTargetPeersOfChaincodeOfChannel(chaincodeInfo, channel);
                if (targetPeers.size < 1) {
                    logger.info(`No target peers are defined for ${chaincodeInfo.id}@${chaincodeInfo.version} on ${channel}, skipping it`);
                    continue;
                }

                // find the peers that don't have the cc installed
                let installTargets = [];

                for (let peer of targetPeers) {
                    let org = this.networkUtil.getOrganizationOfPeer(peer);
                    let admin = this.adminProfiles.get(org);

                    try {
                        /** {@link ChaincodeQueryResponse} */
                        let resp = await admin.queryInstalledChaincodes(peer, true);
                        if (resp.chaincodes.some(cc => cc.name === chaincodeInfo.id && cc.version === chaincodeInfo.version)) {
                            logger.info(`${chaincodeInfo.id}@${chaincodeInfo.version} is already installed on ${peer}`);
                            continue;
                        }

                        installTargets.push(peer);
                    } catch (err) {
                        errors.push(new Error(`Couldn't query installed chaincodes on ${peer}: ${err.message}`));
                    }
                }

                if (errors.length > 0) {
                    let errorMsg = `Could not query whether ${chaincodeInfo.id}@${chaincodeInfo.version} is installed on some peers of ${channel}:`;
                    for (let err of errors) {
                        errorMsg += `\n\t- ${err.message}`;
                    }

                    logger.error(errorMsg);
                    throw new Error(`Could not query whether ${chaincodeInfo.id}@${chaincodeInfo.version} is installed on some peers of ${channel}`);
                }

                // cc is installed on every target peer in the channel
                if (installTargets.length < 1) {
                    continue;
                }

                // install chaincodes org by org
                let orgs = this.networkUtil.getOrganizationsOfChannel(channel);
                for (let org of orgs) {
                    let peersOfOrg = this.networkUtil.getPeersOfOrganization(org);
                    // selecting the target peers for this org
                    let orgPeerTargets = installTargets.filter(p => peersOfOrg.has(p));

                    // cc is installed on every target peer of the org in the channel
                    if (orgPeerTargets.length < 1) {
                        continue;
                    }

                    let admin = this.adminProfiles.get(org);

                    let txId = admin.newTransactionID(true);
                    /** @{ChaincodeInstallRequest} */
                    let request = {
                        targets: orgPeerTargets,
                        chaincodePath: ccObject.language === 'golang' ? ccObject.path : util.resolvePath(ccObject.path),
                        chaincodeId: ccObject.id,
                        chaincodeVersion: ccObject.version,
                        chaincodeType: ccObject.language,
                        txId: txId
                    };

                    // metadata (like CouchDB indices) are only supported since Fabric v1.1
                    if (util.checkProperty(ccObject, 'metadataPath')) {
                        if (!this.networkUtil.isInCompatibilityMode()) {
                            request.metadataPath = util.resolvePath(ccObject.metadataPath);
                        } else {
                            throw new Error(`Installing ${chaincodeInfo.id}@${chaincodeInfo.version} with metadata is not supported in Fabric v1.0`);
                        }
                    }

                    // install to necessary peers of org and process the results
                    try {
                        /** @link{ProposalResponseObject} */
                        let propRespObject = await admin.installChaincode(request);
                        util.assertDefined(propRespObject);

                        /** Array of @link{ProposalResponse} objects */
                        let proposalResponses = propRespObject[0];
                        util.assertDefined(proposalResponses);

                        proposalResponses.forEach((propResponse, index) => {
                            if (propResponse instanceof Error) {
                                let errMsg = `Install proposal error for ${chaincodeInfo.id}@${chaincodeInfo.version} on ${orgPeerTargets[index]}: ${propResponse.message}`;
                                errors.push(new Error(errMsg));
                                return;
                            }

                            /** @link{ProposalResponse} */
                            util.assertProperty(propResponse, 'propResponse', 'response');

                            /** @link{ResponseObject} */
                            let response = propResponse.response;
                            util.assertProperty(response, 'response', 'status');

                            if (response.status !== 200) {
                                let errMsg = `Unsuccessful install status for ${chaincodeInfo.id}@${chaincodeInfo.version} on ${orgPeerTargets[index]}: ${propResponse.response.message}`;
                                errors.push(new Error(errMsg));
                            }
                        });
                    } catch (err) {
                        throw new Error(`Couldn't install ${chaincodeInfo.id}@${chaincodeInfo.version} on peers ${orgPeerTargets.toString()}: ${err.message}`);
                    }

                    // there were some install errors, proceed to the other orgs to gather more information
                    if (errors.length > 0) {
                        continue;
                    }

                    logger.info(`${chaincodeInfo.id}@${chaincodeInfo.version} successfully installed on ${org}'s peers: ${orgPeerTargets.toString()}`);
                }

                if (errors.length > 0) {
                    let errorMsg = `Could not install ${chaincodeInfo.id}@${chaincodeInfo.version} on some peers of ${channel}:`;
                    for (let err of errors) {
                        errorMsg += `\n\t- ${err.message}`;
                    }

                    logger.error(errorMsg);
                    throw new Error(`Could not install ${chaincodeInfo.id}@${chaincodeInfo.version} on some peers of ${channel}`);
                }
            }
        }
    }

    /**
     * Instantiates the chaincodes on their channels.
     * @return {boolean} True, if at least one chaincode was instantiated. Otherwise, false.
     * @private
     * @async
     */
    async _instantiateChaincodes() {
        let channels = this.networkUtil.getChannels();
        let chaincodeInstantiated = false;

        // chaincodes needs to be installed channel by channel
        for (let channel of channels) {
            let chaincodeInfos = this.networkUtil.getChaincodesOfChannel(channel);

            for (let chaincodeInfo of chaincodeInfos) {
                logger.info(`Instantiating ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}. This might take some time...`);

                let ccObject = this.networkUtil.getNetworkObject().channels[channel].chaincodes.find(
                    cc => cc.id === chaincodeInfo.id && cc.version === chaincodeInfo.version);

                let targetPeers = Array.from(this.networkUtil.getTargetPeersOfChaincodeOfChannel(chaincodeInfo, channel));
                if (targetPeers.length < 1) {
                    logger.info(`No target peers are defined for ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}, skipping it`);
                    continue;
                }

                // select a target peer for the chaincode to see if it's instantiated
                // these are the same as the install targets, so if one of the peers has already instantiated the chaincode,
                // then the other targets also had done the same
                let org = this.networkUtil.getOrganizationOfPeer(targetPeers[0]);
                let admin = this.adminProfiles.get(org);

                /** @link{ChaincodeQueryResponse} */
                let queryResponse;
                try {
                    queryResponse = await admin.getChannel(channel, true).queryInstantiatedChaincodes(targetPeers[0], true);
                } catch (err) {
                    throw new Error(`Couldn't query whether ${chaincodeInfo.id}@${chaincodeInfo.version} is instantiated on ${targetPeers[0]}: ${err.message}`);
                }

                util.assertDefined(queryResponse);
                util.assertProperty(queryResponse, 'queryResponse', 'chaincodes');

                if (queryResponse.chaincodes.some(
                    cc => cc.name === chaincodeInfo.id && cc.version === chaincodeInfo.version)) {
                    logger.info(`${chaincodeInfo.id}@${chaincodeInfo.version} is already instantiated in ${channel}`);
                    continue;
                }

                chaincodeInstantiated = true;

                let txId = admin.newTransactionID(true);
                /** @link{ChaincodeInstantiateUpgradeRequest} */
                let request = {
                    targets: targetPeers,
                    chaincodeId: ccObject.id,
                    chaincodeVersion: ccObject.version,
                    chaincodeType: ccObject.language,
                    args: ccObject.init || [],
                    fcn: ccObject.function || 'init',
                    'endorsement-policy': ccObject['endorsement-policy'] ||
                        this.networkUtil.getDefaultEndorsementPolicy(channel, { id: ccObject.id, version: ccObject.version }),
                    transientMap: this.networkUtil.getTransientMapOfChaincodeOfChannel(chaincodeInfo, channel),
                    txId: txId
                };

                // check chaincode language
                // other chaincodes types are not supported in every version
                if (ccObject.language !== 'golang') {
                    if (ccObject.language === 'node' && this.networkUtil.isInCompatibilityMode()) {
                        throw new Error(`${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}: Node.js chaincodes are supported starting from Fabric v1.1`);
                    }

                    if (ccObject.language === 'java' && this.version.lessThan('1.3.0')) {
                        throw new Error(`${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}: Java chaincodes are supported starting from Fabric v1.3`);
                    }

                    if (!['golang', 'node', 'java'].includes(ccObject.language)) {
                        throw new Error(`${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}: unknown chaincode type ${ccObject.language}`);
                    }
                }

                // check private collection configuration
                if (util.checkProperty(ccObject, 'collections-config')) {
                    if (this.version.lessThan('1.2.0')) {
                        throw new Error(`${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}: private collections are supported from Fabric v1.2`);
                    }

                    request['collections-config'] = ccObject['collections-config'];
                }

                /** @link{ProposalResponseObject} */
                let response;
                try {
                    response = await admin.getChannel(channel, true).sendInstantiateProposal(request, this.configChaincodeInstantiateTimeout);
                } catch (err) {
                    throw new Error(`Couldn't endorse ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel} on peers [${targetPeers.toString()}]: ${err.message}`);
                }

                util.assertDefined(response);

                /** @link{Array<ProposalResponse>} */
                let proposalResponses = response[0];
                /** @link{Proposal} */
                let proposal = response[1];
                util.assertDefined(proposalResponses);
                util.assertDefined(proposal);

                // check each response
                proposalResponses.forEach((propResp, index) => {
                    util.assertDefined(propResp);
                    // an Error is returned for a rejected proposal
                    if (propResp instanceof Error) {
                        throw new Error(`Invalid endorsement for ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel} from ${targetPeers[index]}: ${propResp.message}`);
                    } else if (propResp.response.status !== 200) {
                        throw new Error(`Invalid endorsement for ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel} from ${targetPeers[index]}: status code ${propResp.response.status}`);
                    }
                });

                // connect to every event source of every org in the channel
                let eventSources = this._assembleTargetEventSources(channel, targetPeers);
                let eventPromises = [];

                try {
                    // NOTE: everything is resolved, errors are signaled through an Error object
                    // this makes error handling and reporting easier
                    eventSources.forEach((es) => {
                        let promise = new Promise((resolve) => {
                            let timeoutHandle = setTimeout(() => {
                                // unregister manually
                                es.eventHub.unregisterTxEvent(txId.getTransactionID(), false);
                                resolve(new Error(`Commit timeout for ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel} from ${es.peer}`));
                            }, this.configChaincodeInstantiateEventTimeout);

                            es.eventHub.registerTxEvent(txId.getTransactionID(), (tx, code) => {
                                clearTimeout(timeoutHandle);
                                if (code !== 'VALID') {
                                    resolve(new Error(`Invalid commit code for ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel} from ${es.peer}: ${code}`));
                                } else {
                                    resolve(code);
                                }
                            }, /* Error handler */ (err) => {
                                clearTimeout(timeoutHandle);
                                resolve(new Error(`Event hub error from ${es.peer} during instantiating ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}: ${err.message}`));
                            });

                            es.eventHub.connect();
                        });

                        eventPromises.push(promise);
                    });

                    /** @link{TransactionRequest} */
                    let ordererRequest = {
                        txId: txId,
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };

                    /** @link{BroadcastResponse} */
                    let broadcastResponse;
                    try {
                        broadcastResponse = await admin.getChannel(channel, true).sendTransaction(ordererRequest);
                    } catch (err) {
                        throw new Error(`Orderer error for instantiating ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}: ${err.message}`);
                    }

                    util.assertDefined(broadcastResponse);
                    util.assertProperty(broadcastResponse, 'broadcastResponse', 'status');

                    if (broadcastResponse.status !== 'SUCCESS') {
                        throw new Error(`Orderer error for instantiating ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}: ${broadcastResponse.status}`);
                    }

                    // since every event promise is resolved, this shouldn't throw an error
                    let eventResults = await Promise.all(eventPromises);

                    // if we received an error, propagate it
                    if (eventResults.some(er => er instanceof Error)) {
                        let errMsg = `The following errors occured while instantiating ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}:`;
                        let err; // keep the last error
                        for (let eventResult of eventResults) {
                            if (eventResult instanceof Error) {
                                err = eventResult;
                                errMsg += `\n\t- ${eventResult.message}`;
                            }
                        }

                        logger.error(errMsg);
                        throw err;
                    }

                    logger.info(`Successfully instantiated ${chaincodeInfo.id}@${chaincodeInfo.version} in ${channel}`);
                } finally {
                    eventSources.forEach(es => {
                        if (es.eventHub.isconnected()) {
                            es.eventHub.disconnect();
                        }
                    });
                }
            }
        }

        return chaincodeInstantiated;
    }

    /**
     * Joins the peers to the specified channels is necessary.
     * @return {boolean} True, if at least one peer joined a channel. Otherwise, false.
     * @private
     * @async
     */
    async _joinChannels() {
        let channels = this.networkUtil.getChannels();
        let channelJoined = false;
        let errors = [];

        for (let channelName of channels) {
            let genesisBlock = null;
            let orgs = this.networkUtil.getOrganizationsOfChannel(channelName);

            for (let org of orgs) {
                let admin = this.adminProfiles.get(org);
                let channelObject = admin.getChannel(channelName, true);

                let peers = this.networkUtil.getPeersOfOrganizationAndChannel(org, channelName);
                let peersToJoin = [];

                for (let peer of peers) {
                    try {
                        /** {@link ChannelQueryResponse} */
                        let resp = await admin.queryChannels(peer, true);
                        if (resp.channels.some(ch => ch.channel_id === channelName)) {
                            logger.info(`${peer} has already joined ${channelName}`);
                            continue;
                        }

                        peersToJoin.push(peer);
                    } catch (err) {
                        errors.push(new Error(`Couldn't query ${channelName} information from ${peer}: ${err.message}`));
                    }
                }

                if (errors.length > 0) {
                    let errMsg = `The following errors occurred while querying ${channelName} information from ${org}'s peers:`;
                    for (let err of errors) {
                        errMsg += `\n\t- ${err.message}`;
                    }

                    logger.error(errMsg);
                    throw new Error(`Couldn't query ${channelName} information from ${org}'s peers`);
                }

                // all target peers of the org have already joined the channel
                if (peersToJoin.length < 1) {
                    continue;
                }

                channelJoined = true;

                // only retrieve the genesis block once, and "cache" it
                if (genesisBlock === null) {
                    try {
                        let genesisTxId = admin.newTransactionID(true);
                        /** @link{OrdererRequest} */
                        let genesisRequest = {
                            txId: genesisTxId
                        };
                        genesisBlock = await channelObject.getGenesisBlock(genesisRequest);
                    } catch (err) {
                        throw new Error(`Couldn't retrieve the genesis block for ${channelName}: ${err.message}`);
                    }
                }

                let joinTxId = admin.newTransactionID(true);
                let joinRequest = {
                    block: genesisBlock,
                    txId: joinTxId,
                    targets: peersToJoin
                };

                try {
                    /**{@link ProposalResponse} array*/
                    let joinRespArray = await channelObject.joinChannel(joinRequest);
                    util.assertDefined(joinRespArray);

                    // Some errors are returned as Error instances, some as error messages
                    joinRespArray.forEach((propResponse, index) => {
                        if (propResponse instanceof Error) {
                            errors.push(new Error(`${peersToJoin[index]} could not join ${channelName}: ${propResponse.message}`));
                        } else if (propResponse.response.status !== 200) {
                            errors.push(new Error(`${peersToJoin[index]} could not join ${channelName}: ${propResponse.response.message}`));
                        }
                    });
                } catch (err) {
                    new Error(`Couldn't join peers ${peersToJoin.toString()} to ${channelName}: ${err.message}`);
                }

                if (errors.length > 0) {
                    let errMsg = `The following errors occurred while ${org}'s peers tried to join ${channelName}:`;
                    for (let err of errors) {
                        errMsg += `\n\t- ${err.message}`;
                    }

                    logger.error(errMsg);
                    throw new Error(`${org}'s peers couldn't join ${channelName}`);
                }

                logger.info(`${org}'s peers successfully joined ${channelName}: ${peersToJoin}`);
            }
        }

        return channelJoined;
    }

    /**
     * Prepares caches (pre-calculated values) used during transaction invokes.
     * @private
     */
    _prepareCaches() {
        // assemble random target peer cache for each channel's each chaincode
        for (let channel of this.networkUtil.getChannels()) {
            this.randomTargetPeerCache.set(channel, new Map());

            for (let chaincode of this.networkUtil.getChaincodesOfChannel(channel)) {
                let idAndVersion = `${chaincode.id}@${chaincode.version}`;
                this.randomTargetPeerCache.get(channel).set(idAndVersion, new Map());

                let targetOrgs = new Set();
                let targetPeers = this.networkUtil.getTargetPeersOfChaincodeOfChannel(chaincode, channel);

                // get target orgs
                for (let peer of targetPeers) {
                    targetOrgs.add(this.networkUtil.getOrganizationOfPeer(peer));
                }

                // set target peers in each org
                for (let org of targetOrgs) {
                    let peersOfOrg = this.networkUtil.getPeersOfOrganizationAndChannel(org, channel);

                    // the peers of the org that target the given chaincode of the given channel
                    // one of these peers needs to be a target for every org
                    // NOTE: this assumes an n-of-n endorsement policy, which is a safe default
                    this.randomTargetPeerCache.get(channel).get(idAndVersion).set(org, [...peersOfOrg].filter(p => targetPeers.has(p)));
                }
            }
        }

        // assemble random target orderer cache for each channel
        for (let channel of this.networkUtil.getChannels()) {
            this.randomTargetOrdererCache.set(channel, Array.from(this.networkUtil.getOrderersOfChannel(channel)));
        }
    }

    /**
     * Partially assembles a Client object containing general network information.
     * @param {string} org The name of the organization the client belongs to. Mandatory, if the client name is omitted.
     * @param {string} clientName The name of the client to base the profile on.
     *                            If omitted, then the first client of the organization will be used.
     * @param {string} profileName Optional name of the profile that will appear in error messages.
     * @return {Promise<Client>} The partially assembled Client object.
     * @private
     * @async
     */
    async _prepareClientProfile(org, clientName, profileName) {
        let client = clientName;
        if (!client) {
            util.assertDefined(org);
            // base it on the first client connection profile of the org
            let clients = this.networkUtil.getClientsOfOrganization(org);

            // NOTE: this assumes at least one client per org, which is reasonable, the clients will interact with the network
            if (clients.size < 1) {
                throw new Error(`At least one client specification for ${org} is needed to initialize the ${profileName || 'profile'}`);
            }

            client = Array.from(clients)[0];
        }

        // load the general network data from a clone of the network object
        // NOTE: if we provide a common object instead, the Client class will use it directly,
        // and it will be overwritten when loading the next client
        let profile = FabricClient.loadFromConfig(this.networkUtil.getNewNetworkObject());
        profile.loadFromConfig({
            version: '1.0',
            client: this.networkUtil.getClientObject(client)
        });

        try {
            await profile.initCredentialStores();
        } catch (err) {
            throw new Error(`Couldn't initialize the credential stores for ${org}'s ${profileName || 'profile'}: ${err.message}`);
        }

        return profile;
    }

    /**
     * Sets the mutual TLS for the admin of the given organization.
     * @param {string} org The name of the organization.
     * @private
     */
    _setTlsAdminCertAndKey(org) {
        let profile = this.adminProfiles.get(org);
        let crypto = this.networkUtil.getAdminCryptoContentOfOrganization(org);
        profile.setTlsClientCertAndKey(crypto.signedCertPEM.toString(), crypto.privateKeyPEM.toString());
    }

    /**
     * Tries to set the given identity as the current user context for the given profile. Enrolls it if needed and can.
     * @param {Client} profile The Client object whose user context must be set.
     * @param {string} userName The name of the user.
     * @param {string} password The password for the user.
     * @param {string} profileName Optional name of the profile that will appear in error messages.
     * @private
     * @async
     */
    async _setUserContextByEnrollment(profile, userName, password, profileName) {
        try {
            // automatically tries to enroll the given identity with the CA (must be registered)
            await profile.setUserContext({
                username: userName,
                password: password
            }, false);
        } catch (err) {
            throw new Error(`Couldn't enroll ${profileName || 'the user'} or set it as user context: ${err.message}`);
        }
    }

    /**
     * Queries the specified chaincode according to the provided settings.
     *
     * @param {object} context The context previously created by the Fabric adapter.
     * @param {ChaincodeQuerySettings} querySettings The settings associated with the query.
     * @param {number} timeout The timeout for the call in milliseconds.
     * @return {Promise<TxStatus>} The result and stats of the transaction query.
     */
    async _submitSingleQuery(context, querySettings, timeout) {
        let startTime = Date.now();
        this.txIndex++;

        let countAsLoad = querySettings.countAsLoad === undefined ? this.configCountQueryAsLoad : querySettings.countAsLoad;

        // retrieve the necessary client/admin profile
        let invoker;
        let admin = false;

        if (querySettings.invokerIdentity.startsWith('#')) {
            invoker = this.adminProfiles.get(querySettings.invokerIdentity.substring(1));
            admin = true;
        } else {
            invoker = this.clientProfiles.get(querySettings.invokerIdentity);
        }

        // this hints at an error originating from the outside, so it should terminate
        if (!invoker) {
            throw Error(`Invoker ${querySettings.invokerIdentity} not found!`);
        }

        const txIdObject = invoker.newTransactionID(admin);
        const txId = txIdObject.getTransactionID();

        let invokeStatus = new TxStatus(txId);
        invokeStatus.Set('request_type', 'query');
        invokeStatus.SetVerification(true); // querying is a one-step process unlike a normal transaction, so the result is always verified

        ////////////////////////////////
        // SEND TRANSACTION PROPOSALS //
        ////////////////////////////////

        let targetPeers = querySettings.targetPeers ||
            this._assembleRandomTargetPeers(querySettings.channel, querySettings.chaincodeId, querySettings.chaincodeVersion);

        /** @link{ChaincodeInvokeRequest} */
        const proposalRequest = {
            chaincodeId: querySettings.chaincodeId,
            fcn: querySettings.chaincodeFunction,
            args: querySettings.chaincodeArguments || [],
            transientMap: querySettings.transientMap,
            targets: targetPeers
        };

        // the exception should propagate up for an invalid channel name, indicating a user callback module error
        let channel = invoker.getChannel(querySettings.channel, true);


        if (countAsLoad && context.engine) {
            context.engine.submitCallback(1);
        }

        /** Array of {Buffer|Error} */
        let results = null;

        // NOTE: everything happens inside a try-catch
        // no exception should escape, query failures have to be handled gracefully
        try {
            // NOTE: wrap it in a Promise to enforce user-provided timeout
            let resultPromise = new Promise(async (resolve, reject) => {
                let timeoutHandle = setTimeout(() => {
                    reject(new Error('TIMEOUT'));
                }, this._getRemainingTimeout(startTime, timeout));

                let result = await channel.queryByChaincode(proposalRequest, admin);
                clearTimeout(timeoutHandle);
                resolve(result);
            });

            results = await resultPromise;

            ///////////////////////
            // CHECK THE RESULTS //
            ///////////////////////

            let errMsg;

            // filter for errors inside, so we have accurate indices for the corresponding peers
            results.forEach((value, index) => {
                let targetName = targetPeers[index];
                if (value instanceof Error) {
                    invokeStatus.Set(`endorsement_result_error_${targetName}`, value.message);
                    errMsg = `\n\t- Endorsement error from ${targetName}: ${value.message}`;
                } else {
                    // NOTE: the last result will be kept
                    invokeStatus.SetResult(value);
                    invokeStatus.Set(`endorsement_result_${targetName}`, value);
                }
            });

            if (errMsg) {
                invokeStatus.SetStatusFail();
                logger.error(`Query error for ${querySettings.chaincodeId}@${querySettings.chaincodeVersion} in ${querySettings.channel}:${errMsg}`);
            } else {
                invokeStatus.SetStatusSuccess();
            }
        } catch (err) {
            invokeStatus.SetStatusFail();
            invokeStatus.Set('unexpected_error', err.message);
            logger.error(`Unexpected query error for ${querySettings.chaincodeId}@${querySettings.chaincodeVersion} in ${querySettings.channel}: ${err.stack ? err.stack : err}`);
        }

        return invokeStatus;
    }

    /**
     * Invokes the specified chaincode according to the provided settings.
     *
     * @param {object} context The context previously created by the Fabric adapter.
     * @param {ChaincodeInvokeSettings} invokeSettings The settings associated with the transaction submission.
     * @param {number} timeout The timeout for the whole transaction life-cycle in milliseconds.
     * @return {Promise<TxStatus>} The result and stats of the transaction invocation.
     */
    async _submitSingleTransaction(context, invokeSettings, timeout) {
        // note start time to adjust the timeout parameter later
        const startTime = Date.now();
        this.txIndex++; // increase the counter
	//logger.info('TRANSACTION INDEX, ' + this.txIndex);
        // NOTE: since this function is a hot path, there aren't any assertions for the sake of efficiency

        // retrieve the necessary client/admin profile
        let invoker;
        let admin = false;

        if (invokeSettings.invokerIdentity.startsWith('#')) {
            invoker = this.adminProfiles.get(invokeSettings.invokerIdentity.substring(1));
            admin = true;
        } else {
            invoker = this.clientProfiles.get(invokeSettings.invokerIdentity);
        }

        // this hints at an error originating from the outside, so it should terminate
        if (!invoker) {
            throw Error(`Invoker ${invokeSettings.invokerIdentity} not found!`);
        }

        ////////////////////////////////
        // PREPARE SOME BASIC OBJECTS //
        ////////////////////////////////

        const txIdObject = invoker.newTransactionID(admin);
        const txId = txIdObject.getTransactionID();

        // timestamps are recorded for every phase regardless of success/failure
        let invokeStatus = new TxStatus(txId);
        invokeStatus.Set('request_type', 'transaction');

        let errors = []; // errors are collected during response validations

        ////////////////////////////////
        // SEND TRANSACTION PROPOSALS //
        ////////////////////////////////

        let targetPeers = invokeSettings.targetPeers ||
            this._assembleRandomTargetPeers(invokeSettings.channel, invokeSettings.chaincodeId, invokeSettings.chaincodeVersion);

        /** @link{ChaincodeInvokeRequest} */
        const proposalRequest = {
            chaincodeId: invokeSettings.chaincodeId,
            fcn: invokeSettings.chaincodeFunction,
            args: invokeSettings.chaincodeArguments || [],
            txId: txIdObject,
            transientMap: invokeSettings.transientMap,
            targets: targetPeers
        };

        let channel = invoker.getChannel(invokeSettings.channel, true);

        /** @link{ProposalResponseObject} */
        let proposalResponseObject = null;

        // NOTE: everything happens inside a try-catch
        // no exception should escape, transaction failures have to be handled gracefully
        try {
            if (context.engine) {
                context.engine.submitCallback(1);
            }
            try {
                // account for the elapsed time up to this point
                //proposalResponseObject = await channel.sendTransactionProposal(proposalRequest);
                proposalResponseObject = await channel.sendTransactionProposal(proposalRequest,300000);
                //proposalResponseObject = await channel.sendTransactionProposal(proposalRequest,
                    //this._getRemainingTimeout(startTime, timeout));

                invokeStatus.Set('endorse_latency', Date.now()-startTime);
            } catch (err) {
                //invokeStatus.Set('endorse_latency', Date.now()-startTime);
                //invokeStatus.Set('endorse_error', true);
                //invokeStatus.Set('proposal_error', err.message);

                // error occurred, early life-cycle termination, definitely failed
                invokeStatus.SetVerification(true);

                errors.push(err);
                throw errors; // handle every logging in one place at the end
            }

            //////////////////////////////////
            // CHECKING ENDORSEMENT RESULTS //
            //////////////////////////////////

            /** @link{Array<ProposalResponse>} */
            const proposalResponses = proposalResponseObject[0];
            /** @link{Proposal} */
            const proposal = proposalResponseObject[1];

            // NOTES: filter inside, so we have accurate indices corresponding to the original target peers
            proposalResponses.forEach((value, index) => {
                let targetName = targetPeers[index];

                // Errors from peers/chaincode are returned as an Error object
                if (value instanceof Error) {
		    invokeStatus.Set('endorse_error', value.message);
                    invokeStatus.Set(`proposal_response_error_${targetName}`, value.message);

                    // explicit rejection, early life-cycle termination, definitely failed
                    invokeStatus.SetVerification(true);
                    errors.push(new Error(`Proposal response error by ${targetName}: ${value.message}`));
                    return;
                }

                /** @link{ProposalResponse} */
                let proposalResponse = value;

                // save a chaincode results/response
                // NOTE: the last one will be kept as result
                invokeStatus.SetResult(proposalResponse.response.payload);
                invokeStatus.Set(`endorsement_result_${targetName}`, proposalResponse.response.payload);

                // verify the endorsement signature and identity if configured
                if (this.configVerifyProposalResponse) {
                    if (!channel.verifyProposalResponse(proposalResponse)) {
                        invokeStatus.Set('endorse_sig_error', true);
			invokeStatus.Set(`endorsement_verify_error_${targetName}`, 'INVALID');

                        // explicit rejection, early life-cycle termination, definitely failed
                        invokeStatus.SetVerification(true);
                        errors.push(new Error(`Couldn't verify endorsement signature or identity of ${targetName}`));
                        return;
                    }
                }

                /** @link{ResponseObject} */
                let responseObject = proposalResponse.response;

                if (responseObject.status !== 200) {
		    invokeStatus.Set('endorse_denied_error', true);
                    invokeStatus.Set(`endorsement_result_error_${targetName}`, `${responseObject.status} ${responseObject.message}`);

                    // explicit rejection, early life-cycle termination, definitely failed
                    invokeStatus.SetVerification(true);
                    errors.push(new Error(`Endorsement denied by ${targetName}: ${responseObject.message}`));
                }
            });

            // if there were errors, stop further processing, jump to the end
            if (errors.length > 0) {
                throw errors;
            }

            if (this.configVerifyReadWriteSets) {
                // check all the read/write sets to see if they're the same
                if (!channel.compareProposalResponseResults(proposalResponses)) {
		    //totalEndorsementFailures++;
		    invokeStatus.Set('endorse_rwmismatch_error', true);
                    invokeStatus.Set('read_write_set_error', 'MISMATCH');

                    // r/w set mismatch, early life-cycle termination, definitely failed
                    invokeStatus.SetVerification(true);
                    errors.push(new Error('Read/Write set mismatch between endorsements'));
                    throw errors;
                }
            }

            /////////////////////////////////
            // REGISTERING EVENT LISTENERS //
            /////////////////////////////////

            let eventPromises = []; // to wait for every event response

            // NOTE: in compatibility mode, the same EventHub can be used for multiple channels
            // if the peer is part of multiple channels
            this.channelEventSourcesCache.get(invokeSettings.channel).forEach((eventSource) => {
                eventPromises.push(this._createEventRegistrationPromise(eventSource,
                    txId, invokeStatus, startTime, timeout));
            });

	    //invokeStatus.Set('endorse_total_time', Date.now()-startTime);

            ///////////////////////////////////////////
            // SUBMITTING TRANSACTION TO THE ORDERER //
            ///////////////////////////////////////////

	    const orderingStartTime = Date.now();
	    invokeStatus.Set('ordering_start_time', orderingStartTime);

            let targetOrderer = invokeSettings.orderer || this._getRandomTargetOrderer(invokeSettings.channel);

            /** @link{TransactionRequest} */
            const transactionRequest = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                orderer: targetOrderer
            };

            /** @link{BroadcastResponse} */
            let broadcastResponse;
            try {
                // wrap it in a Promise to add explicit timeout to the call
                let responsePromise = new Promise(async (resolve, reject) => {
                    let timeoutHandle = setTimeout(() => {
			invokeStatus.Set('ordering_broadcast_timeout', true);		
                        reject(new Error('TIMEOUT'));
//                    }, this._getRemainingTimeout(startTime, timeout));
                    }, 900000);

                    let result = await channel.sendTransaction(transactionRequest);
                    clearTimeout(timeoutHandle);
                    resolve(result);
                });

                broadcastResponse = await responsePromise;
            } catch (err) {
                // missing the ACK does not mean anything, the Tx could be already under ordering
                // so let the events decide the final status, but log this error
                invokeStatus.Set(`broadcast_error_${targetOrderer}`, err.message);
                logger.warn(`Broadcast error from ${targetOrderer}: ${err.message}`);
            }

            invokeStatus.Set('time_orderer_ack', Date.now());
	    invokeStatus.Set('ordering_submission_latency', Date.now()-orderingStartTime);

	    if (broadcastResponse != undefined) {
	            if (broadcastResponse.status !== 'SUCCESS') {
			invokeStatus.Set('ordering_error', broadcastResponse.status);
			broadcasterrorfailures++;
        	        invokeStatus.Set(`broadcast_response_error_${targetOrderer}`, broadcastResponse.status);

        	        // the submission was explicitly rejected, so the Tx will definitely not be ordered
        	        invokeStatus.SetVerification(true);
        	        errors.push(new Error(`${targetOrderer} response error with status ${broadcastResponse.status}`));
        	        throw errors;
        	    }
	    } else {

			errors.push(new Error(`No response from ${targetOrderer}. Broadcast timeout`));
			throw errors;
		}
            //////////////////////////////
            // PROCESSING EVENT RESULTS //
            //////////////////////////////

            // this shouldn't throw, otherwise the error handling is not robust
            let eventResults = await Promise.all(eventPromises);

            // NOTE: this is the latency@threshold support described by the PSWG in their first paper
            let failedNotifications = eventResults.filter(er => !er.successful);

            // NOTE: an error from any peer indicates some problem, don't mask it;
            // although one successful transaction should be enough for "eventual" success;
            // errors from some peer indicate transient problems, errors from all peers probably indicate validation errors
            if (failedNotifications.length > 0) {
                invokeStatus.SetStatusFail();

                let logMsg = `Transaction[${txId.substring(0, 10)}] commit errors:`;
                for (let commitErrors of failedNotifications) {
                    logMsg += `\n\t- ${commitErrors.message}`;
		    invokeStatus.Set('commit_error', commitErrors.message);
                }

                logger.error(logMsg);

		// sort ascending by finish time
                eventResults.sort((a, b) => a.time - b.time);

                // transform to (0,length] by *, then to (-1,length-1] by -, then to [0,length-1] by ceil
                let thresholdIndex = Math.ceil(eventResults.length * this.configLatencyThreshold - 1);

                invokeStatus.Set('orderingandvalidation_time', eventResults[thresholdIndex].time - orderingStartTime);
                invokeStatus.Set('total_transaction_time', eventResults[thresholdIndex].time - startTime);


            } else {
                // sort ascending by finish time
                eventResults.sort((a, b) => a.time - b.time);

                // transform to (0,length] by *, then to (-1,length-1] by -, then to [0,length-1] by ceil
                let thresholdIndex = Math.ceil(eventResults.length * this.configLatencyThreshold - 1);

                // every commit event contained a VALID code
                // mark the time corresponding to the set threshold
                invokeStatus.SetStatusSuccess(eventResults[thresholdIndex].time);
		invokeStatus.Set('commit_success_time', eventResults[thresholdIndex].time);
		invokeStatus.Set('orderingandvalidation_time', eventResults[thresholdIndex].time - orderingStartTime);
		invokeStatus.Set('total_transaction_time', eventResults[thresholdIndex].time - startTime);
            }
        } catch (err) {
            invokeStatus.SetStatusFail();

            // not the expected error array was thrown, an unexpected error occurred, log it with stack if available
            if (!Array.isArray(err)) {
                invokeStatus.Set('unexpected_error', err.message);
                logger.error(`Transaction[${txId.substring(0, 10)}] unexpected error: ${err.stack ? err.stack : err}`);
		invokeStatus.Set('submittx_error', err.message);
            } else if (err.length > 0) {
                let logMsg = `Transaction[${txId.substring(0, 10)}] life-cycle errors:`;
                for (let execError of err) {
                    logMsg += `\n\t- ${execError.message}`;
		    invokeStatus.Set('submittx_expected_error', execError.message);
                }

                logger.error(logMsg);
            }
        }

        return invokeStatus;
    }

    ///////////////////////////////////////
    //Collect transaction failure metrics//
    ///////////////////////////////////////


    //Calculate total intra block failures.
    getIntraBlockFailures(failtxindex, block, blocksize) {
	var writeKeys = new Array();
	for (let txindex = 0; txindex <= failtxindex; txindex++) {
		let txactions = block.data.data[txindex].payload.data.actions
                if (txactions != undefined) {
			let rwsetsize = txactions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
                        if (rwsetsize > 1) {
				for (let rwindex = 0; rwindex < rwsetsize; rwindex++) {
					let rwset = txactions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[rwindex];
					if (txindex == failtxindex){
						let readsetsize = rwset.rwset.reads.length;
						let rindex = 0;
                                                if (rwset.namespace != 'lscc') {
                                                        while (rindex < readsetsize) {
                                                                if (writeKeys.includes(rwset.rwset.reads[rindex].key)) {
									totalintraBlockFailures++;
									break;
								}
                                                                rindex++;
                                                        }
                                                }
	
					}
					else {
                                        	let writesetsize = rwset.rwset.writes.length;
                                        	let windex = 0;
                                        	if (rwset.namespace != 'lscc') {
                                        		while (windex < writesetsize) {
                                        	        	writeKeys.push(rwset.rwset.writes[windex].key);
                                        	                windex++;
                                        	        }
                                        	}
					}

				}
			}
		}

	}

    }
    //Generate conflict graph per block. Count number of cycles. This is <= intra block failures
    getconflictGraphCycles(block, blocksize) {
	for (let txindex1 = 0; txindex1 < blocksize; txindex1++) {
		for (let txindex2 = 0; txindex2 < blocksize; txindex2++) {
			var writeKeys = new Array();
			if (txindex1 != txindex2) {
				let txactions1 = block.data.data[txindex1].payload.data.actions
				let txactions2 = block.data.data[txindex2].payload.data.actions
				if (txactions2 != undefined) {
					let rwsetsize = txactions2[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
                        		if (rwsetsize > 1) {
						for (let rwindex = 0; rwindex < rwsetsize; rwindex++) {
						  let rwset = txactions2[0].payload.action.proposal_response_payload.extension.results.ns_rwset[rwindex];
						  let writesetsize = rwset.rwset.writes.length;
        	                                  let windex = 0;
 	                                          if (rwset.namespace != 'lscc') {
                                                  	while (windex < writesetsize) {
                                                        	writeKeys.push(rwset.rwset.writes[windex].key);
                                                                windex++;
                                                        }
                                                  }


						} 
					}
				}
				if (txactions1 != undefined) {
					let rwsetsize = txactions2[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
					if (rwsetsize > 1) {
						for (let rwindex = 0; rwindex < rwsetsize; rwindex++) {
						  let rwset = txactions2[0].payload.action.proposal_response_payload.extension.results.ns_rwset[rwindex];
						  let readsetsize = rwset.rwset.reads.length;
						  let rindex = 0;
						  if (rwset.namespace != 'lscc') {
							while (rindex < readsetsize) {
                                                                
                                                                if (writeKeys.includes(rwset.rwset.reads[rindex].key)) {
                                                                        g.setEdge(txindex1, txindex2);
                                                                        break;
                                                                }
                                                                rindex++;
                                                        }

						  }
						}
					}
				}
				
			}
	        }

	}	
	totalirresolvableFailures = totalirresolvableFailures + graphlib.alg.findCycles(g).length;
	for (let i = 0; i < g.nodeCount(); i++) {
	        g.removeNode(i);
        }

    }
    //Count all transaction failures
    getTransactionFailures(blockchain, blockchainheight) {

	for (let blockindex = 0; blockindex < blockchainheight; blockindex++) {
		
		let blocksize = blockchain[blockindex].data.data.length;
		let txstatus = blockchain[blockindex].metadata.metadata[2];
		for (let txindex = 0; txindex < blocksize; txindex++) {
			
			if (txstatus[txindex] == 0){
				totalSuccTransactions++;
			}
			//Non-zero transaction status implies transaction failure
			else if (txstatus[txindex] == 11) {
				totalmvccFailures++;
				totalFailedTransactions++;
				this.getIntraBlockFailures(txindex, blockchain[blockindex], blocksize);
			}
			else if (txstatus[txindex] == 10) {
				totalEndorsementFailures++;
				totalFailedTransactions++;
			}
			else if (txstatus[txindex] == 12) {
				totalPhantomReads++;
				totalFailedTransactions++;
			}
			else {
				totalOtherFailures++;
				totalFailedTransactions++;
				otherfailurescode.push(txstatus[txindex]);
			}

		}
		this.getconflictGraphCycles(blockchain[blockindex], blocksize);

	}

	logger.info('TxFailuresInfo Total: Total Tx Failures = ' + totalFailedTransactions);
        logger.info('TxFailuresInfo Total: Total Tx Succeeds = ' + totalSuccTransactions);
        logger.info('TxFailuresInfo Total: Total MVCC Failures = ' + totalmvccFailures);
        logger.info('TxFailuresInfo Total: Total IntraBlock Failures = ' + totalintraBlockFailures);
        logger.info('TxFailuresInfo Total: Total Cross Block Failures = ' + (totalmvccFailures - totalintraBlockFailures));
        logger.info('TxFailuresInfo Total: Total Endorsement Failures = ' + totalEndorsementFailures);
        logger.info('TxFailuresInfo Total: Total Phantom Read Failures = ' + totalPhantomReads);
        logger.info('TxFailuresInfo Total: Total Other Failures = ' + totalOtherFailures);
        logger.info('TxFailuresInfo Total: Total Other Failures Code= ' + otherfailurescode);
	logger.info('TxFailuresInfo Total: Total totalirresolvableFailures = ' + totalirresolvableFailures);
	logger.info('TxFailuresInfo Total: Total broadcasterrorfailures = ' + broadcasterrorfailures);
    }


    //////////////////////////
    // PUBLIC API FUNCTIONS //
    //////////////////////////

    /**
     * Prepares the adapter by loading user data and connection to the event hubs.
     *
     * @param {string} name Unused.
     * @param {Array<string>} args Unused.
     * @param {number} clientIdx The client index.
     * @return {Promise<{networkInfo : FabricNetwork, eventSources: EventSource[]}>} Returns the network utility object.
     * @async
     */
    async getContext(name, args, clientIdx) {
        // reload the profiles silently
        await this._initializeRegistrars(false);
        await this._initializeAdmins(false);
        await this._initializeUsers(false);

        for (let channel of this.networkUtil.getChannels()) {
            // initialize the channels by getting the config from the orderer
            //await this._initializeChannel(this.registrarProfiles, channel);
            await this._initializeChannel(this.adminProfiles, channel);
            await this._initializeChannel(this.clientProfiles, channel);
        }

        this.clientIndex = clientIdx;
        this.txIndex = -1; // reset counter for new test round

        if (this.networkUtil.isInCompatibilityMode()) {
            // NOTE: for old event hubs we have a single connection to every peer set as an event source
            const EventHub = require('fabric-client/lib/EventHub.js');

            for (let peer of this.networkUtil.getAllEventSources()) {
                let org = this.networkUtil.getOrganizationOfPeer(peer);
                let admin = this.adminProfiles.get(org);

                let eventHub = new EventHub(admin);
                eventHub.setPeerAddr(this.networkUtil.getPeerEventUrl(peer),
                    this.networkUtil.getGrpcOptionsOfPeer(peer));

                // we can use the same peer for multiple channels in case of peer-level eventing
                this.eventSources.push({
                    channel: this.networkUtil.getChannelsOfPeer(peer),
                    peer: peer,
                    eventHub: eventHub
                });
            }
        } else {
            // NOTE: for channel event hubs we might have multiple connections to a peer,
            // so connect to the defined event sources of every org in every channel
            for (let channel of this.networkUtil.getChannels()) {
                for (let org of this.networkUtil.getOrganizationsOfChannel(channel)) {
                    let admin = this.adminProfiles.get(org);

                    // The API for retrieving channel event hubs changed, from SDK v1.2 it expects the MSP ID of the org
                    let orgId = this.version.lessThan('1.2.0') ? org : this.networkUtil.getMspIdOfOrganization(org);

                    let eventHubs = admin.getChannel(channel, true).getChannelEventHubsForOrg(orgId);

                    // the peer (as an event source) is associated with exactly one channel in case of channel-level eventing
                    for (let eventHub of eventHubs) {
                        this.eventSources.push({
                            channel: [channel],
                            peer: this.networkUtil.getPeerNameOfEventHub(eventHub),
                            eventHub: eventHub
                        });
                    }
                }
            }
        }

        this.eventSources.forEach((es) => {
            es.eventHub.connect(false);
        });

        // rebuild the event source cache
        this.channelEventSourcesCache = new Map();

        for (let es of this.eventSources) {
            let channels = es.channel;

            // an event source can be used for multiple channels in compatibility mode
            for (let c of channels) {
                // initialize the cache for a channel with an empty array at the first time
                if (!this.channelEventSourcesCache.has(c)) {
                    this.channelEventSourcesCache.set(c, []);
                }

                // add the event source to the channels collection
                let eventSources = this.channelEventSourcesCache.get(c);
                eventSources.push(es);
            }
        }

	if (name == 'readBlockchain' && clientIdx == 0) {
		logger.info('Inside IF fabric-cpp.js');

		let channelObj = null;
		for (let channel of this.networkUtil.getChannels()) {
                	for (let org of this.networkUtil.getOrganizationsOfChannel(channel)) {
                    		let admin = this.adminProfiles.get(org);
	                        channelObj = admin.getChannel(channel, true);
				//console.log(JSON.stringify(channelObject));
				//console.log(JSON.stringify(blockchaininfo));
			}
		}
		let blockchaininfo = await channelObj.queryInfo();
		let blockchainheight = blockchaininfo.height;
		blockchainheight = blockchainheight|0;
		console.log("BlockchainHeight:");
		console.log(blockchainheight);
		let blocksize = 0;
		const block = [];
                for (let index = 0; index < blockchainheight; index++) {
                    block.push(await channelObj.queryBlock(index));
                }
		this.getTransactionFailures(block, blockchainheight);
       	        //logger.info('BLOCKCHAIN');
       	        //logger.info(block);
       	        //logger.info('BLOCKCHAIN STRINGIFY');
       	        //logger.info(JSON.stringify(block));

		/*
		for (let index = 0; index < blockchainheight; index++) {
                                blocksize += block[index].data.data.length;
                        }
                        logger.info('Average Blocksize = ' + blocksize/blockchainheight);

                        logger.info('Analyze Transaction Failures');
                        let totalSuccTransactions = 0;
                        let totalFailedTransactions = 0;
                        let totalmvccFailures = 0;
                        let totalintraBlockFailures = 0;
                        let totalirresolvableFailures = 0;
			let otherfailurescode = new Array();
                        //let readKeys = [];
			var readKeys = new Array();
			var txreadKeys = new Array();
                        let intraBlockFailures = 0;
                        let blockFailures = 0;
                        let totalEndorsementFailures = 0;
                        let totalPhantomReads = 0;
                        let totalOtherFailures = 0;
			let lastblocksize = block[blockchainheight -1].data.data.length;
			let lasttransactioncommittime = block[blockchainheight-1].data.data[lastblocksize-1].payload.header.channel_header.timestamp
                        for (let index = 0; index < blockchainheight; index++) {

				if (index == 5) {
					logger.info('BLOCK STRINGIFY');
					logger.info(JSON.stringify(block[index]));
				}
                                intraBlockFailures = 0;
                                blockFailures = 0;
                                let blocksize = block[index].data.data.length;


				for (let txindex1 = 0; txindex1 < blocksize; txindex1++) {
					g.setNode(txindex1);
					txreadKeys.length = 0;
                                        let txactions = block[index].data.data[txindex1].payload.data.actions
                                        if (txactions != undefined) {
						let rwsetsize = block[index].data.data[txindex1].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
                                                if (rwsetsize > 1) {
                                                	for (let rwindex = 0; rwindex < rwsetsize; rwindex++) {
								let rwset = block[index].data.data[txindex1].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[rwindex];
                                                        	let readsetsize = rwset.rwset.reads.length;
                                                        	let rindex = 0;
                                                                if (rwset.namespace != 'lscc') {
                                                                	while (rindex < readsetsize) {
                                                                        	txreadKeys.push(rwset.rwset.reads[rindex].key);
                                                                                rindex++;
                                                                        }
                                                                }
                                                        }
                                                }
                                       }


					for (let txindex2 = 0; txindex2 < blocksize; txindex2++) {

						if (txindex1 != txindex2) {
							if (readKeys.length > 0) {
								let newtxactions = block[index].data.data[txindex2].payload.data.actions
								if (newtxactions != undefined) {
									let newrwsetsize = block[index].data.data[txindex2].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
									if (newrwsetsize > 1) {
										for (let newrwindex = 0; newrwindex < newrwsetsize; newrwindex++) {
											let newrwset = block[index].data.data[txindex2].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[newrwindex];
                                                					let newwritesetsize = newrwset.rwset.writes.length;
                                                					let windex = 0;
											if (newrwset.namespace != 'lscc') {
												while (windex < newwritesetsize) {
                                                        						if (txreadKeys.includes(newrwset.rwset.writes[windex].key)) {
														g.setEdge(txindex2, txindex1);
													}
													windex++;
												}
											}
										}
									}
								}
							}

						}
					}

				}



                                txIterateLoop:
                                for (let txindex = 0; txindex < blocksize; txindex++) {
					//if (index == 5) {
						//g.setNode(txindex);
						if (txindex == 0) {
							const nodes = new Map();
							nodes.set(txindex, 'blocksObj'+txindex);
							sortOp = new TopologicalSort(nodes);
						}
						else {
							//sortOp.addNode('blocksObj'+txindex, txindex);
						//}
					//}
					let failurecounter = 0;
                                        readKeys.length = 0;
                                        let txstatus = block[index].metadata.metadata[2];
                                        let txactions = block[index].data.data[txindex].payload.data.actions
                                        if (txactions != undefined) {
 		                        let rwsetsize = block[index].data.data[txindex].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
					if (rwsetsize > 1) {
                                        for (let rwindex = 0; rwindex < rwsetsize; rwindex++) {
					let rwset = block[index].data.data[txindex].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[rwindex];
                                    	let readsetsize = rwset.rwset.reads.length;
                                        let rindex = 0;
                                        if (rwset.namespace != 'lscc') {
                                        if (txstatus[txindex] != 0) {
					    if (failurecounter == 0) {
							logger.info('TEST 6');
                                            	blockFailures++;
                                            	totalFailedTransactions++;
                                            	if (txstatus[txindex] == 11) {
                                            	    totalmvccFailures++;
                                            	}
                                            	else if (txstatus[txindex] == 10) {
                                            	    totalEndorsementFailures++;
                                            	}
                                            	else if (txstatus[txindex] == 12) {
                                            	    totalPhantomReads++;
                                            	}
                                            	else {
                                            	    totalOtherFailures++;
                                            	    logger.info('Other Failures Code= ' + txstatus[txindex]);
						    otherfailurescode.push(txstatus[txindex]);
                                            	}
						failurecounter =1;
					    }
                                            while (rindex < readsetsize) {
                                                readKeys.push(rwset.rwset.reads[rindex].key);
						rindex++;
                                            }
                                        }
					else if (txstatus[txindex] == 0) {
						if(rwindex == 0) {
							totalSuccTransactions++;
						}
					}
                                    }
                                }
                            }
                        }

                        if (readKeys.length > 0) {
				//let intracount = 0;

                            for (let newindex = 0; newindex < txindex; newindex++) {
                                if (txstatus[newindex] == 0) {
                                    let newtxactions = block[index].data.data[newindex].payload.data.actions
                                    if (newtxactions != undefined) {
				    let newrwsetsize = block[index].data.data[newindex].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset.length;
                                    if (newrwsetsize > 1) {
                                            for (let newrwindex = 0; newrwindex < newrwsetsize; newrwindex++) {
					    	let newrwset = block[index].data.data[newindex].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[newrwindex];
                                                let newwritesetsize = newrwset.rwset.writes.length;
                                                let windex = 0;
                                                if (newrwset.namespace != 'lscc') {

                                                    while (windex < newwritesetsize) {
                                                        if (readKeys.includes(newrwset.rwset.writes[windex].key)) {
								//if (index == 5) {
								//	logger.info('readKeys ' + readKeys);
								//	logger.info('writekey' + newrwset.rwset.writes[windex].key);
								//}

							    //if (index == 5) {
				                            	var i = readKeys.length;
								while (i--) {
       									if (readKeys[i] === newrwset.rwset.writes[windex].key) {
           									//sortOp.addEdge('blocksObj'+i, 'blocksObj'+txindex);
										g.setEdge(newindex, txindex);
       									}
							    	}
							    //}

							    //if (intracount == 0) {
                                                            	intraBlockFailures++;
                                                            	totalintraBlockFailures++;
                                                            	continue txIterateLoop;
								//intracount = 1;
							    //}
                                                        }
                                                        windex++;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                        }

                    }
		    logger.info('TxFailuresInfo: IntraBlock Failures in Block ' + index + ' = ' + intraBlockFailures);
                    logger.info('TxFailuresInfo: Total Failures in Block ' + index + ' = ' + blockFailures);
		    //if (index == 5) {
					//logger.info('GRAPH JSON');
                                        //console.log(graphlib.json.write(g));
					console.log('GRAPH CYCLES IN BLOCK', index, ': ', graphlib.alg.findCycles(g));
					totalirresolvableFailures = totalirresolvableFailures + graphlib.alg.findCycles(g).length;
					console.log('Number of CYCLES IN BLOCK', index, ': ', graphlib.alg.findCycles(g).length);
					console.log(graphlib.alg.findCycles(g));
					console.log('GRAPH IN BLOCK', index, ': ', 'Is ACYCLIC: ', graphlib.alg.isAcyclic(g));
					console.log('NodeNumber: ', g.nodeCount());
					console.log('EdgeNumber: ', g.edgeCount());
					if (index == 5) {
						console.log('Edges: ', g.edges());
					}
					//logger.info('GRAPH TOPSORT');
					//if (graphlib.alg.isAcyclic(g)) {
					//	console.log(graphlib.alg.topsort(g));
					//}

					for (let i = 0; i < g.nodeCount(); i++) {
						g.removeNode(i);
					}

                                        logger.info('GRAPH');
                                        logger.info(sortOp);
                                        logger.info(JSON.stringify(sortOp));
                                        logger.info(JSON.stringify(sortOp.nodes));
					console.log(sortOp.nodes);
					console.log(sortOp.nodes);
                                        logger.info('TOPSORTGRAPH');
                                        console.log(sortOp.sort());
                                        console.log(JSON.stringify(sortOp.sort()));
                                        logger.info(sortOp.sort());
                                        logger.info(JSON.stringify(sortOp.sort()));
                              //  }


                }
                logger.info('TxFailuresInfo Total: Total Tx Failures = ' + totalFailedTransactions);
                logger.info('TxFailuresInfo Total: Total Tx Succeeds = ' + totalSuccTransactions);
                logger.info('TxFailuresInfo Total: Total MVCC Failures = ' + totalmvccFailures);
                logger.info('TxFailuresInfo Total: Total IntraBlock Failures = ' + totalintraBlockFailures);
                logger.info('TxFailuresInfo Total: Total Cross Block Failures = ' + (totalmvccFailures - totalintraBlockFailures));
                logger.info('TxFailuresInfo Total: Total Endorsement Failures = ' + totalEndorsementFailures);
                logger.info('TxFailuresInfo Total: Total Phantom Read Failures = ' + totalPhantomReads);
                logger.info('TxFailuresInfo Total: Total Other Failures = ' + totalOtherFailures);
                logger.info('TxFailuresInfo Total: Total Other Failures Code= ' + otherfailurescode);
                logger.info('TxFailuresInfo Total: Total totalirresolvableFailures = ' + totalirresolvableFailures);
                logger.info('TxFailuresInfo Total: Total broadcasterrorfailures = ' + broadcasterrorfailures);
                logger.info('TxFailuresInfo Total: Total lasttransactioncommittime = ' + lasttransactioncommittime);

	*/
	}

        return {
            networkInfo: this.networkUtil
        };
    }

    /**
     * Initializes the Fabric adapter: sets up clients, admins, registrars, channels and chaincodes.
     * @async
     */
    async init() {
        let tlsInfo = this.networkUtil.isMutualTlsEnabled() ? 'mutual'
            : (this.networkUtil.isTlsEnabled() ? 'server' : 'none');
        let compMode = this.networkUtil.isInCompatibilityMode() ? '; Fabric v1.0 compatibility mode' : '';
        logger.info(`Fabric SDK version: ${this.version.toString()}; TLS: ${tlsInfo}${compMode}`);

        await this._initializeRegistrars(true);
        await this._initializeAdmins(true);
        await this._initializeUsers(true);

        if (await this._createChannels()) {
            logger.info(`Sleeping ${this.configSleepAfterCreateChannel / 1000.0}s...`);
            await util.sleep(this.configSleepAfterCreateChannel);
        }

        if (await this._joinChannels()) {
            logger.info(`Sleeping ${this.configSleepAfterJoinChannel / 1000.0}s...`);
            await util.sleep(this.configSleepAfterJoinChannel);
        }
    }

    /**
     * Installs and initializes the specified chaincodes.
     * @async
     */
    async installSmartContract() {
        await this._installChaincodes();
        if (await this._instantiateChaincodes()) {
            logger.info(`Sleeping ${this.configSleepAfterInstantiateChaincode / 1000.0}s...`);
            await util.sleep(this.configSleepAfterInstantiateChaincode);
        }
    }

    /**
     * Invokes the specified chaincode according to the provided settings.
     *
     * @param {object} context The context previously created by the Fabric adapter.
     * @param {string} contractID The unique contract ID of the target chaincode.
     * @param {string} contractVersion Unused.
     * @param {ChaincodeInvokeSettings|ChaincodeInvokeSettings[]} invokeSettings The settings (collection) associated with the (batch of) transactions to submit.
     * @param {number} timeout The timeout for the whole transaction life-cycle in seconds.
     * @return {Promise<TxStatus[]>} The result and stats of the transaction invocation.
     */
    async invokeSmartContract(context, contractID, contractVersion, invokeSettings, timeout) {
        timeout = timeout || this.configDefaultTimeout;
        let promises = [];
        let settingsArray;

        if (!Array.isArray(invokeSettings)) {
            settingsArray = [invokeSettings];
        } else {
            settingsArray = invokeSettings;
        }

        for (let settings of settingsArray) {
            let contractDetails = this.networkUtil.getContractDetails(contractID);
            if (!contractDetails) {
                throw new Error(`Could not find details for contract ID ${contractID}`);
            }

            settings.channel = contractDetails.channel;
            settings.chaincodeId = contractDetails.id;
            settings.chaincodeVersion = contractDetails.version;

            if (!settings.invokerIdentity) {
                settings.invokerIdentity = this.defaultInvoker;
            }

            promises.push(this._submitSingleTransaction(context, settings, timeout * 1000));
        }

        return await Promise.all(promises);
    }

    /**
     * Queries the specified chaincode according to the provided settings.
     *
     * @param {object} context The context previously created by the Fabric adapter.
     * @param {string} contractID The unique contract ID of the target chaincode.
     * @param {string} contractVersion Unused.
     * @param {ChaincodeQuerySettings|ChaincodeQuerySettings[]} querySettings The settings (collection) associated with the (batch of) query to submit.
     * @param {number} timeout The timeout for the call in seconds.
     * @return {Promise<TxStatus[]>} The result and stats of the transaction query.
     */
    async querySmartContract(context, contractID, contractVersion, querySettings, timeout) {
        timeout = timeout || this.configDefaultTimeout;
        let promises = [];
        let settingsArray;

        if (!Array.isArray(querySettings)) {
            settingsArray = [querySettings];
        } else {
            settingsArray = querySettings;
        }

        for (let settings of settingsArray) {
            let contractDetails = this.networkUtil.getContractDetails(contractID);
            if (!contractDetails) {
                throw new Error(`Could not find details for contract ID ${contractID}`);
            }

            settings.channel = contractDetails.channel;
            settings.chaincodeId = contractDetails.id;
            settings.chaincodeVersion = contractDetails.version;

            if (!settings.invokerIdentity) {
                settings.invokerIdentity = this.defaultInvoker;
            }

            promises.push(this._submitSingleQuery(context, settings, timeout * 1000));
        }

        return await Promise.all(promises);
    }

    /**
     * Releases the resources of the adapter.
     *
     * @param {object} context Unused.
     * @async
     */
    async releaseContext(context) {
        this.eventSources.forEach((es) => {
            if (es.eventHub.isconnected()) {
                es.eventHub.disconnect();
            }
        });

        this.eventSources = [];
    }
}

module.exports = Fabric;
