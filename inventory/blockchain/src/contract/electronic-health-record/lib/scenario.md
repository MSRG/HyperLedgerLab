# EHR Real World Scenarios

## Scenarios

- not including the init scenarios
- all random key accesses follow a normal distribution with *µ := keyspace / 2* and *standard deviation*.

1. *Patient* queries personal profile:
    - *single-read* operation, targeting a specific world-state entry
2. *Patient* grants profile access to *Physician* and revokes the access
    - two *read-write* operations
3. *Physician* ask for a partial view of a patients profile
    - single *read* operation
4. *Physician* adds EHR to a patients profile
    - two *read-write* operations, the operation can also be aborted if the actor does not have the necessary access rights
5. *Physician/Researcher* queries EHR
    - single *read* operation, the operation can also be aborted if the actor does not have the necessary access rights
6. *Patient* grants access and revokes to a specific EHR
    - two *read-write* operation
7. *Physician/Researcher* queries all their EHR
    - Couch DB JSON Query
