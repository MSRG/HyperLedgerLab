'use strict';

module.exports.info = 'Fabcar: Creating cars.';

let txIndex = 0;
let carModels = {
    "Toyota": ["Prius", "Camry"],
    "Ford": ["Focus", "EcoSport"],
    "Hyundai": ["i20", "i30"],
    "Volkswagon": ["Polo GT", "Golf"],
    "BMW": ["320", "535i"],
    "Audi": ["A3", "A5"],
    "Suzuki": ["Swift", "Vitara"],
    "Honda": ["Civic", "CR-V"],
    "Mercedes Benz": ["A180", "AMG GT"],
    "Tesla": ["Roadster", "Model X"],
    "Tata": ["Nano", "Range Rover"]
};
let carColors = ["White", "Red", "Metallic Black", "Matte Black", "Blue", "Chrome Blue"];
let carOwners = ["David", "Sahil", "Philip", "Andrea", "Max", "Zack", "Tom", "Sam", "Akash"];

let bc, contx;
module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

module.exports.run = function () {
    txIndex++;

    let myCarMake = Object.keys(carModels)[txIndex % Object.keys(carModels).length];
    let myCarModels = carModels[myCarMake];

    // let carObject = new Map();
    // carObject.set('transaction_type', "createCar");
    // carObject.set('CarID', 'car_' + txIndex.toString() + '_' + process.pid.toString());
    // carObject.set('Make', myCarMake);
    // carObject.set('Model', myCarModels[Math.floor(Math.random() * myCarModels.length)]);
    // carObject.set('Colour', carColors[Math.floor(Math.random() * carColors.length)]);
    // carObject.set('Owner', carOwners[Math.floor(Math.random() * carOwners.length)]);
    // Fabric adapter expects an Object, so can't use Map
    return bc.invokeSmartContract(
        contx,
        'fabcar',
        'v1',
        [{
            transaction_type: "createCar",
            CarID: 'car_' + txIndex.toString() + '_' + process.pid.toString(),
            Make: myCarMake,
            Model: myCarModels[Math.floor(Math.random() * myCarModels.length)],
            Colour: carColors[Math.floor(Math.random() * carColors.length)],
            Owner: carOwners[Math.floor(Math.random() * carOwners.length)]
        }],
        30
    );
};

module.exports.end = function () {
    return Promise.resolve();
};
