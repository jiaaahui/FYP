-- One-shot INSERT file generated from your pasted Firestore documents.
-- No "ON CONFLICT" clauses (per your request). Run on a staging DB first.
-- Usage (example PowerShell):
-- $env:PGPASSWORD = "your_db_password"
-- & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U your_user -d your_db -f server/sql/insert_all_data.sql

-- Insert into Zone
INSERT INTO Zone (ZoneID, ZoneName) VALUES
('ZON_00001', 'KLCC'),
('ZON_00002', 'KL Sentral'),
('ZON_00003', 'Bukit Bintang'),
('ZON_00004', 'Mont Kiara'),
('ZON_00005', 'Damansara'),
('ZON_00006', 'Petaling Jaya'),
('ZON_00007', 'Subang Jaya'),
('ZON_00008', 'Shah Alam'),
('ZON_00009', 'Cheras'),
('ZON_00010', 'Ampang'),
('ZON_00011', 'Bangsar'),
('ZON_00012', 'Puchong'),
('ZON_00013', 'Kajang'),
('ZON_00014', 'Setapak'),
('ZON_00015', 'Ad-hoc');


-- ------------------------------
-- Teams
-- ------------------------------
INSERT INTO Team (TeamID, TeamType) VALUES ('TEM_00001', 'Delivery 1');
INSERT INTO Team (TeamID, TeamType) VALUES ('TEM_00002', 'Delivery 2');
INSERT INTO Team (TeamID, TeamType) VALUES ('TEM_00003', 'Installer 1');
INSERT INTO Team (TeamID, TeamType) VALUES ('TEM_00004', 'Warehouse 1');
INSERT INTO Team (TeamID, TeamType) VALUES ('TEM_00005', 'Delivery 3');
INSERT INTO Team (TeamID, TeamType) VALUES ('TEM_00006', 'Warehouse 2');

-- ------------------------------
-- Customers
-- ------------------------------
INSERT INTO Customer (CustomerID, name, address, email, phone, createdAt)
VALUES ('CUS_00001', 'Ali', 'Unit 11-01, Random Condo', 'cust1@example.com', '0126922636', now());

INSERT INTO Customer (CustomerID, name, address, email, phone, createdAt)
VALUES ('CUS_00002', 'Abu', 'Unit 12-02, Random Condo', 'cust2@example.com', '0128563248', now());

INSERT INTO Customer (CustomerID, name, address, email, phone, createdAt)
VALUES ('CUS_00003', 'Haziq', 'Unit 13-03, Random Condo', 'cust3@example.com', '0129863547', now());

INSERT INTO Customer (CustomerID, name, address, email, phone, createdAt)
VALUES ('CUS_00004', 'Adam', 'Unit 14-04, Random Condo', 'chewjh0707@gmail.com', '0125727470', now());

INSERT INTO Customer (CustomerID, name, address, email, phone, createdAt)
VALUES ('CUS_00005', 'Hafiz', 'Unit 15-05, Random Condo', 'cust5@example.com', '0121510130', now());

-- Additional customer-like documents keyed by doc id (use doc id as CustomerID)
INSERT INTO Customer (CustomerID, name, city, address, postcode, state, notificationsEnabled, phone, createdAt, email)
VALUES ('yM7cootDpZPe2mW1ang023bIZGB2','Howard Wong','Petaling Jaya','Tiara Damansara Jalan 17/1','50600','Kuala Lumpur', TRUE, '0138505210', '2025-08-14T04:18:19Z'::timestamptz, 'wongwenhao19@gmail.com');

INSERT INTO Customer (CustomerID, name, displayName, email, createdAt)
VALUES ('euEi7hwmGQM6LnajgTn62KQdfpv2','Jia Hui Chew','Jia Hui Chew','chewjh0707@gmail.com','2025-08-23T18:53:01Z'::timestamptz);

-- ------------------------------
-- Users (optional table)
-- ------------------------------
INSERT INTO users (uid, name, displayName, email, createdAt)
VALUES ('AHS7tMmRGjZ6SOeQpXMIPpRsfOL2', 'Jia', NULL, '22004739@siswa.um.edu.my', '2025-06-05T08:17:02Z'::timestamptz);

INSERT INTO users (uid, name, displayName, email, createdAt)
VALUES ('Od7GkyePBNUDDxs3lsQ1e4wJyvA3', 'Jia Hui Chew', 'Jia Hui Chew', 'chewjh0707@gmail.com', '2025-08-12T11:43:16Z'::timestamptz);

INSERT INTO users (uid, name, displayName, email, createdAt)
VALUES ('euEi7hwmGQM6LnajgTn62KQdfpv2', 'Jia Hui Chew', 'Jia Hui Chew', 'chewjh0707@gmail.com', '2025-08-13T19:44:33Z'::timestamptz);

-- ------------------------------
-- Employees
-- ------------------------------

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00003', 'Lee', '0125687815', TRUE, 'installer', 'lee@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00004', 'Raj', '0194005717', TRUE, 'installer', 'raj@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00006', 'Chan', '0157130809', TRUE, 'warehouse loader team', 'chan@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00007', 'Muthu', '0158261264', TRUE, 'delivery team', 'muthu@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00008', 'Nur', '0120293379', TRUE, 'delivery team', 'nur@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00009', 'Kumar', '0147422349', TRUE, 'warehouse loader team', 'kumar@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00010', 'Aisyah binti Rosma', '0121604508', TRUE, 'delivery team', 'aisyah@tbm.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00011', 'Jh', '0123432355', TRUE, 'warehouse loader team', 'jh@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00013', 'Tester 1', '01224444332', TRUE, 'delivery team', 'tester1@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00014', 'Tester3', '0122222222', FALSE, 'installer', 'tester3@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt, bio)
VALUES ('EMP_00015', 'Jia Hui Chew', '0123455571', TRUE, 'installer', 'chewjh0707@gmail.com', now(), '');

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00017', 'Test Test test test test test test test test test', '', TRUE, 'installer', 'testtesttesttesttesttesttesttesttesttest@gmail.com', now());

INSERT INTO Employee (EmployeeID, name, contact_number, active_flag, role, email, createdAt)
VALUES ('EMP_00018', 'Terry Chong', '0125478965', TRUE, 'delivery team', 'tbmstaff@tbm.com', now());


-- ------------------------------
-- EmployeeTeamAssignment
-- ------------------------------
-- Skip entries with empty TeamID
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00018', 'TEM_00006');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00009', 'TEM_00006');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00017', 'TEM_00001');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00006', 'TEM_00004');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00004', 'TEM_00003');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00015', 'TEM_00001');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00011', 'TEM_00004');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00007', 'TEM_00002');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00003', 'TEM_00003');
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00008', 'TEM_00002');
-- ocRUbnJQy... had empty TeamID, skipped
INSERT INTO EmployeeTeamAssignment (EmployeeID, TeamID) VALUES ('EMP_00010', 'TEM_00002');

-- ------------------------------
-- Trucks
-- ------------------------------
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00001','ZLA1463',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00002','MGO6232',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00003','TVL1374',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00004','XLX4898',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00005','EAX6221',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00006','ICH8352',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00007','RXC5865',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00008','YIY6585',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00009','DSC3319',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00010','OSX7218',1,260,170,180);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00011','ESZ4286',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00012','FWY0837',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00013','KAC3327',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00014','YBZ2515',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00015','NGN3008',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00016','VDT8720',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00017','GAZ9829',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00018','DZQ5238',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00019','XWD4558',3,443,250,210);
INSERT INTO Truck (TruckID, CarPlate, Tone, LengthCM, WidthCM, HeightCM) VALUES ('TRK_00020','FAC6652',3,443,250,210);

-- ------------------------------
-- TruckZone (composite PK TruckID, ZoneID)
-- ------------------------------
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00017','ZON_00003', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00010','ZON_00015', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00004','ZON_00002', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00005','ZON_00014', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00018','ZON_00008', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00001','ZON_00013', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00004','ZON_00006', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00015','ZON_00004', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00019','ZON_00011', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00007','ZON_00002', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00003','ZON_00012', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00005','ZON_00015', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00009','ZON_00014', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00008','ZON_00013', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00015','ZON_00008', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00020','ZON_00006', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00003','ZON_00015', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00011','ZON_00003', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00007','ZON_00001', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00005','ZON_00007', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00012','ZON_00014', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00006','ZON_00008', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00006','ZON_00005', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00016','ZON_00007', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00013','ZON_00004', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00002','ZON_00011', FALSE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00014','ZON_00004', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00008','ZON_00010', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00012','ZON_00010', TRUE);
INSERT INTO TruckZone (TruckID, ZoneID, IsPrimaryZone) VALUES ('TRK_00019','ZON_00015', FALSE);

-- ------------------------------
-- Buildings
-- ------------------------------

INSERT INTO Building (BuildingID, BuildingName, HousingType, PostalCode, ZoneID, VehicleSizeLimit, LoadingBayAvailable, AccessTimeWindowStart, AccessTimeWindowEnd, PreRegistrationRequired, LiftAvailable, Notes)
VALUES ('BLD_00002','KL Trillion','Condominium','51481','ZON_00001','1T', FALSE, '09:00', '17:00', TRUE, FALSE, '');

INSERT INTO Building (BuildingID, BuildingName, HousingType, PostalCode, ZoneID, VehicleSizeLimit, LoadingBayAvailable, AccessTimeWindowStart, AccessTimeWindowEnd, PreRegistrationRequired, LiftAvailable, Notes)
VALUES ('BLD_00003','Mont Kiara Aman','Condominium','52304','ZON_00004','1T', TRUE, '09:00', '17:00', TRUE, TRUE, '');

INSERT INTO Building (BuildingID, BuildingName, HousingType, PostalCode, ZoneID, VehicleSizeLimit, LoadingBayAvailable, AccessTimeWindowStart, AccessTimeWindowEnd, PreRegistrationRequired, LiftAvailable, Notes)
VALUES ('BLD_00004','Sunway SPK','Condominium','51966','ZON_00006','1T', TRUE, '09:00', '17:00', TRUE, TRUE, '');

INSERT INTO Building (BuildingID, BuildingName, HousingType, PostalCode, ZoneID, VehicleSizeLimit, LoadingBayAvailable, AccessTimeWindowStart, AccessTimeWindowEnd, PreRegistrationRequired, LiftAvailable, Notes)
VALUES ('BLD_00005','Empire City','Condominium','51479','ZON_00007','1T', TRUE, '09:00', '17:00', TRUE, TRUE, '');

INSERT INTO Building (BuildingID, BuildingName, HousingType, PostalCode, ZoneID, VehicleSizeLimit, LoadingBayAvailable, AccessTimeWindowStart, AccessTimeWindowEnd, PreRegistrationRequired, LiftAvailable, Notes)
VALUES ('BLD_00006','Setapak Green','Condominium','58907','ZON_00014','1T', TRUE, '09:00', '17:00', TRUE, TRUE, '');

INSERT INTO Building (BuildingID, BuildingName, HousingType, PostalCode, ZoneID, VehicleSizeLimit, LoadingBayAvailable, AccessTimeWindowStart, AccessTimeWindowEnd, PreRegistrationRequired, LiftAvailable, Notes)
VALUES ('BLD_00007','Bangsar Park Residence','Condominium','54231','ZON_00011','1T', TRUE, '09:00', '17:00', TRUE, TRUE, '');

INSERT INTO Building (BuildingID, BuildingName, HousingType, PostalCode, ZoneID, VehicleSizeLimit, LoadingBayAvailable, AccessTimeWindowStart, AccessTimeWindowEnd, PreRegistrationRequired, LiftAvailable, Notes)
VALUES ('BLD_00008','OUG Parklane','Condominium','54069','ZON_00009','1T', TRUE, '09:00', '17:00', TRUE, TRUE, '');


-- ------------------------------
-- LorryTrip
-- ------------------------------
INSERT INTO LorryTrip (LorryTripID, DeliveryTeamID, WarehouseTeamID, TruckID)
VALUES ('TRP_00001','TEM_00001','TEM_00001','TRK_00006');

INSERT INTO LorryTrip (LorryTripID, DeliveryTeamID, WarehouseTeamID, TruckID)
VALUES ('TRP_00002','TEM_00002','TEM_00004','TRK_00012');

INSERT INTO LorryTrip (LorryTripID, DeliveryTeamID, WarehouseTeamID, TruckID)
VALUES ('TRP_00003','TEM_00005','TEM_00004','TRK_00011');

INSERT INTO LorryTrip (LorryTripID, DeliveryTeamID, WarehouseTeamID, TruckID)
VALUES ('TRP_00004','TEM_00002','TEM_00002','TRK_00003');

INSERT INTO LorryTrip (LorryTripID, DeliveryTeamID, WarehouseTeamID, TruckID)
VALUES ('TRP_00005','TEM_00002','TEM_00004','TRK_00006');

-- ------------------------------
-- TimeSlot
-- ------------------------------
INSERT INTO TimeSlot (TimeSlotID, LorryTripID, Date, TimeWindowStart, TimeWindowEnd, AvailableFlag)
VALUES ('TSL_00001','TRP_00002','2025-06-11'::date,'08:00','12:00', TRUE);

INSERT INTO TimeSlot (TimeSlotID, LorryTripID, Date, TimeWindowStart, TimeWindowEnd, AvailableFlag)
VALUES ('TSL_00002','TRP_00005','2025-06-12'::date,'08:00','12:00', TRUE);

INSERT INTO TimeSlot (TimeSlotID, LorryTripID, Date, TimeWindowStart, TimeWindowEnd, AvailableFlag)
VALUES ('TSL_00003','TRP_00003','2025-06-13'::date,'08:00','12:00', TRUE);

INSERT INTO TimeSlot (TimeSlotID, LorryTripID, Date, TimeWindowStart, TimeWindowEnd, AvailableFlag)
VALUES ('TSL_00004','TRP_00005','2025-06-14'::date,'08:00','12:00', TRUE);

INSERT INTO TimeSlot (TimeSlotID, LorryTripID, Date, TimeWindowStart, TimeWindowEnd, AvailableFlag)
VALUES ('TSL_00005','TRP_00001','2025-06-15'::date,'08:00','12:00', TRUE);

-- ------------------------------
-- Products
-- ------------------------------
INSERT INTO Product (ProductID, ProductName, PackageLengthCM, PackageWidthCM, PackageHeightCM, InstallerTeamRequiredFlag, DismantleExtraTime, EstimatedInstallationTimeMin, EstimatedInstallationTimeMax, FragileFlag, NoLieDownFlag)
VALUES ('PRD_00001','TV (standalone)',90,71,69, FALSE, 10, 10, 15, TRUE, FALSE);

INSERT INTO Product (ProductID, ProductName, PackageLengthCM, PackageWidthCM, PackageHeightCM, InstallerTeamRequiredFlag, DismantleExtraTime, EstimatedInstallationTimeMin, EstimatedInstallationTimeMax, FragileFlag, NoLieDownFlag)
VALUES ('PRD_00002','TV (wall bracket)',76,91,84, FALSE, 10, 30, 40, TRUE, FALSE);

INSERT INTO Product (ProductID, ProductName, PackageLengthCM, PackageWidthCM, PackageHeightCM, InstallerTeamRequiredFlag, DismantleExtraTime, EstimatedInstallationTimeMin, EstimatedInstallationTimeMax, FragileFlag, NoLieDownFlag)
VALUES ('PRD_00003','Fridge',57,79,87, FALSE, 10, 5, 10, TRUE, TRUE);

INSERT INTO Product (ProductID, ProductName, PackageLengthCM, PackageWidthCM, PackageHeightCM, InstallerTeamRequiredFlag, DismantleExtraTime, EstimatedInstallationTimeMin, EstimatedInstallationTimeMax, FragileFlag, NoLieDownFlag)
VALUES ('PRD_00004','Washing Machine',59,86,89, FALSE, 10, 20, 30, FALSE, FALSE);

INSERT INTO Product (ProductID, ProductName, PackageLengthCM, PackageWidthCM, PackageHeightCM, InstallerTeamRequiredFlag, DismantleExtraTime, EstimatedInstallationTimeMin, EstimatedInstallationTimeMax, FragileFlag, NoLieDownFlag)
VALUES ('PRD_00005','Panasonic Dryer A700',107,88,53, FALSE, 10, 10, 15, FALSE, FALSE);

INSERT INTO Product (ProductID, ProductName, PackageLengthCM, PackageWidthCM, PackageHeightCM, InstallerTeamRequiredFlag, DismantleExtraTime, EstimatedInstallationTimeMin, EstimatedInstallationTimeMax, FragileFlag, NoLieDownFlag)
VALUES ('PRD_00006','DAIKIN Air Conditioner',115,83,43, TRUE, 10, 60, 90, FALSE, FALSE);

-- ------------------------------
-- Orders (many - mapping fields present in your Firestore)
-- ------------------------------
INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, CustomerRating, DelayReason, CustomerFeedback, ProofOfDeliveryURL, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00001',
  'yM7cootDpZPe2mW1ang023bIZGB2',
  'EMP_00011',
  'TEM_00001',
  'BLD_00008',
  'TSL_00001',
  0,
  '2025-09-10T03:48:05.459000Z'::timestamptz,
  '2025-09-10T07:48:05.443000Z'::timestamptz,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'Scheduled',
  '2025-06-13T17:48:05.479816Z'::timestamptz,
  '2025-06-08T15:48:05.140000Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, OrderStatus, UpdatedAt, CreatedAt, CustomerFeedback)
VALUES (
  'ORD_00002',
  'yM7cootDpZPe2mW1ang023bIZGB2',
  'EMP_00017',
  'TEM_00001',
  'BLD_00003',
  'TSL_00005',
  0,
  '2025-09-08T05:48:05.055000Z'::timestamptz,
  '2025-09-08T09:48:05.594000Z'::timestamptz,
  'Pending',
  '2025-06-13T17:48:05.822605Z'::timestamptz,
  '2025-06-06T17:48:05.822453Z'::timestamptz,
  NULL
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00003',
  'CUS_00005',
  'EMP_00017',
  'TEM_00002',
  'BLD_00005',
  'TSL_00005',
  0,
  '2025-06-11T15:48:06.823771Z'::timestamptz,
  '2025-06-11T19:48:06.823771Z'::timestamptz,
  'Scheduled',
  '2025-06-13T17:48:06.823915Z'::timestamptz,
  '2025-06-10T15:48:06.823771Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00004',
  'CUS_00002',
  'EMP_00017',
  'TEM_00002',
  'BLD_00003',
  'TSL_00004',
  0,
  '2025-06-04T17:48:07.249780Z'::timestamptz,
  '2025-06-04T21:48:07.249780Z'::timestamptz,
  'Pending',
  '2025-06-13T17:48:07.249923Z'::timestamptz,
  '2025-06-03T17:48:07.249780Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00005',
  'CUS_00002',
  'EMP_00010',
  'TEM_00003',
  'BLD_00002',
  'TSL_00005',
  0,
  '2025-06-08T15:48:08.299430Z'::timestamptz,
  '2025-06-08T19:48:08.299430Z'::timestamptz,
  'Scheduled',
  '2025-06-13T17:48:08.299592Z'::timestamptz,
  '2025-06-07T15:48:08.299430Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00006',
  'CUS_00005',
  'EMP_00010',
  'TEM_00003',
  'BLD_00003',
  'TSL_00002',
  1,
  '2025-05-30T17:48:08.602471Z'::timestamptz,
  '2025-05-30T21:48:08.602471Z'::timestamptz,
  '2025-05-30T18:07:08.602471Z'::timestamptz,
  '2025-05-30T19:33:08.602471Z'::timestamptz,
  '2025-05-30T18:35:08.602471Z'::timestamptz,
  'https://dummy.pod/ORD_00006.jpg',
  'Very satisfied!',
  4.7,
  'Completed',
  '2025-06-13T17:48:08.603048Z'::timestamptz,
  '2025-05-29T17:48:08.602471Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00007',
  'CUS_00004',
  'EMP_00015',
  'TEM_00001',
  'BLD_00005',
  'TSL_00005',
  1,
  '2025-05-21T15:48:09.644272Z'::timestamptz,
  '2025-05-21T19:48:09.644272Z'::timestamptz,
  '2025-05-21T15:53:09.644272Z'::timestamptz,
  '2025-05-21T16:47:09.644272Z'::timestamptz,
  '2025-05-21T16:11:09.644272Z'::timestamptz,
  'https://dummy.pod/ORD_00007.jpg',
  'Very satisfied!',
  4.6,
  'Completed',
  '2025-06-13T17:48:09.644348Z'::timestamptz,
  '2025-05-20T15:48:09.644272Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00008',
  'CUS_00005',
  'EMP_00010',
  'TEM_00001',
  'BLD_00004',
  'TSL_00005',
  1,
  '2025-05-31T16:48:09.925358Z'::timestamptz,
  '2025-05-31T20:48:09.925358Z'::timestamptz,
  '2025-05-31T16:48:09.925358Z'::timestamptz,
  '2025-05-31T18:06:09.925358Z'::timestamptz,
  '2025-05-31T17:12:09.925358Z'::timestamptz,
  'https://dummy.pod/ORD_00008.jpg',
  'Team was polite.',
  4.5,
  'Completed',
  '2025-06-13T17:48:09.925431Z'::timestamptz,
  '2025-05-30T16:48:09.925358Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00009',
  'CUS_00001',
  'EMP_00007',
  'TEM_00001',
  'BLD_00002',
  'TSL_00002',
  1,
  '2025-06-09T17:48:10.993888Z'::timestamptz,
  '2025-06-09T21:48:10.993888Z'::timestamptz,
  '2025-06-09T17:48:10.993888Z'::timestamptz,
  '2025-06-09T19:47:10.993888Z'::timestamptz,
  '2025-06-09T18:05:10.993888Z'::timestamptz,
  'https://dummy.pod/ORD_00009.jpg',
  'Late due to rain.',
  3.6,
  'Completed',
  '2025-06-13T17:48:10.993981Z'::timestamptz,
  '2025-06-08T17:48:10.993888Z'::timestamptz
);


-- Orders 11..20 (following same mapping)
INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00011','CUS_00004','EMP_00015','TEM_00001','BLD_00005','TSL_00003',1,
  '2025-05-19T15:48:12.289502Z'::timestamptz,'2025-05-19T19:48:12.289502Z'::timestamptz,
  '2025-05-19T16:05:12.289502Z'::timestamptz,'2025-05-19T18:07:12.289502Z'::timestamptz,'2025-05-19T16:11:12.289502Z'::timestamptz,
  'https://dummy.pod/ORD_00011.jpg','Late due to rain.',4.9,'Completed','2025-06-13T17:48:12.289573Z'::timestamptz,'2025-05-18T15:48:12.289502Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00012','yM7cootDpZPe2mW1ang023bIZGB2','EMP_00010','TEM_00003','BLD_00004','TSL_00004',1,
  '2025-05-25T14:48:12.585203Z'::timestamptz,'2025-05-25T18:48:12.585203Z'::timestamptz,
  '2025-05-25T15:03:12.585203Z'::timestamptz,'2025-05-25T17:15:12.585203Z'::timestamptz,'2025-05-25T15:31:12.585203Z'::timestamptz,
  'https://dummy.pod/ORD_00012.jpg','Excellent!',3.7,'Delivered','2025-06-13T17:48:12.585261Z'::timestamptz,'2025-05-24T14:48:12.585203Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00013','CUS_00003','EMP_00017','TEM_00001','BLD_00008','TSL_00005',1,
  '2025-05-24T17:48:13.642946Z'::timestamptz,'2025-05-24T21:48:13.642946Z'::timestamptz,
  '2025-05-24T18:03:13.642946Z'::timestamptz,'2025-05-24T19:04:13.642946Z'::timestamptz,'2025-05-24T18:32:13.642946Z'::timestamptz,
  'https://dummy.pod/ORD_00013.jpg','Smooth delivery.',4.2,'Completed','2025-06-13T17:48:13.643047Z'::timestamptz,'2025-05-23T17:48:13.642946Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00014','CUS_00003','EMP_00017','TEM_00002','BLD_00007','TSL_00003',1,
  '2025-05-16T15:48:13.920904Z'::timestamptz,'2025-05-16T19:48:13.920904Z'::timestamptz,
  '2025-05-16T16:08:13.920904Z'::timestamptz,'2025-05-16T17:26:13.920904Z'::timestamptz,'2025-05-16T16:22:13.920904Z'::timestamptz,
  'https://dummy.pod/ORD_00014.jpg','Excellent!',4.9,'Completed','2025-06-13T17:48:13.920976Z'::timestamptz,'2025-05-15T15:48:13.920904Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00015','CUS_00001','EMP_00010','TEM_00003','BLD_00004','TSL_00003',1,
  '2025-05-19T14:48:14.987418Z'::timestamptz,'2025-05-19T18:48:14.987418Z'::timestamptz,
  '2025-05-19T14:53:14.987418Z'::timestamptz,'2025-05-19T16:32:14.987418Z'::timestamptz,'2025-05-19T15:30:14.987418Z'::timestamptz,
  'https://dummy.pod/ORD_00015.jpg','Late due to rain.',4.7,'Completed','2025-06-13T17:48:14.987491Z'::timestamptz,'2025-05-18T14:48:14.987418Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00016','CUS_00001','EMP_00010','TEM_00003','BLD_00005','TSL_00001',1,
  '2025-05-26T17:48:15.462501Z'::timestamptz,'2025-05-26T21:48:15.462501Z'::timestamptz,
  '2025-05-26T17:56:15.462501Z'::timestamptz,'2025-05-26T20:17:15.462501Z'::timestamptz,'2025-05-26T18:21:15.462501Z'::timestamptz,
  'https://dummy.pod/ORD_00016.jpg','Team was polite.',4.1,'Completed','2025-06-13T17:48:15.462566Z'::timestamptz,'2025-05-25T17:48:15.462501Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00017','CUS_00003','EMP_00017','TEM_00002','BLD_00002','TSL_00003',1,
  '2025-06-07T17:48:16.296800Z'::timestamptz,'2025-06-07T21:48:16.296800Z'::timestamptz,
  '2025-06-07T18:07:16.296800Z'::timestamptz,'2025-06-07T19:53:16.296800Z'::timestamptz,'2025-06-07T18:23:16.296800Z'::timestamptz,
  'https://dummy.pod/ORD_00017.jpg','Smooth delivery.',4.6,'Completed','2025-06-13T17:48:16.296837Z'::timestamptz,'2025-06-06T17:48:16.296800Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00018','CUS_00003','EMP_00007','TEM_00001','BLD_00004','TSL_00001',1,
  '2025-06-01T15:48:16.765623Z'::timestamptz,'2025-06-01T19:48:16.765623Z'::timestamptz,
  '2025-06-01T16:00:16.765623Z'::timestamptz,'2025-06-01T18:15:16.765623Z'::timestamptz,'2025-06-01T16:23:16.765623Z'::timestamptz,
  'https://dummy.pod/ORD_00018.jpg','Quick and clean.',5.0,'Completed','2025-06-13T17:48:16.765702Z'::timestamptz,'2025-05-31T15:48:16.765623Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00019','CUS_00003','EMP_00010','TEM_00001','BLD_00008','TSL_00002',1,
  '2025-06-08T14:48:17.621793Z'::timestamptz,'2025-06-08T18:48:17.621793Z'::timestamptz,
  '2025-06-08T14:59:17.621793Z'::timestamptz,'2025-06-08T16:01:17.621793Z'::timestamptz,'2025-06-08T15:20:17.621793Z'::timestamptz,
  'https://dummy.pod/ORD_00019.jpg','Excellent!',3.7,'Completed','2025-06-13T17:48:17.621865Z'::timestamptz,'2025-06-07T14:48:17.621793Z'::timestamptz
);

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, DeliveryTeamID, BuildingID, TimeSlotID, NumberOfAttempts, ScheduledStartDateTime, ScheduledEndDateTime, ActualStartDateTime, ActualEndDateTime, ActualArrivalDateTime, ProofOfDeliveryURL, CustomerFeedback, CustomerRating, OrderStatus, UpdatedAt, CreatedAt)
VALUES (
  'ORD_00020','CUS_00003','EMP_00010','TEM_00001','BLD_00003','TSL_00004',1,
  '2025-05-31T17:48:18.128780Z'::timestamptz,'2025-05-31T21:48:18.128780Z'::timestamptz,
  '2025-05-31T18:06:18.128780Z'::timestamptz,'2025-05-31T19:24:18.128780Z'::timestamptz,'2025-05-31T18:32:18.128780Z'::timestamptz,
  'https://dummy.pod/ORD_00020.jpg','Quick and clean.',4.7,'Delivered','2025-06-13T17:48:18.128819Z'::timestamptz,'2025-05-30T17:48:18.128780Z'::timestamptz
);

-- ------------------------------
-- OrderProduct
-- ------------------------------
-- Use composite PK (OrderID, ProductID)
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00004','PRD_00002',1);
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00002','PRD_00006',2);
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00002','PRD_00002',1);
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00005','PRD_00006',2);
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00001','PRD_00005',1);
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00003','PRD_00006',2);
-- VWyyWRW8 had Quantity as string '1' -> cast to int
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00012','PRD_00006',1);
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00004','PRD_00005',2);
INSERT INTO OrderProduct (OrderID, ProductID, Quantity) VALUES ('ORD_00003','PRD_00001',1);
