oleId (PK) 
roleName 

2. User Authentication for all users.
userId (PK) 
firstName,
lastName,
Email,
Mobile,
Password,
roleId(FK),
profilePhoto,
emailVerified,
mobileVerified,
lastLogin,
Status,
createdAt,
updated At,
deletedAt 
3.City master
Id
Name
status
createAt
updateAt
deleteAT

3. Clinic Clinic master. 
clinicId (PK), 
name,
registrationNo,
Email,
Phone,
Website,
Logo,
Address,
City,
state, 
country,
postalCode,
Latitude,
Longitude,
Description,
Status,
createdBy,
createdAt,
updatedAt,
deletedAt 

4. ClinicUser ( Maps users to clinics ) . 
clinicUserId(PK) 
clinicId(FK),
userId(FK),
Designation,
joiningDate,
status 





5. Department Department master. 
departmentId(PK) 
Name,
Description,
status 

6. Service Service master. 
serviceId(PK)
 Name,
Description,
Price,
status 

7. ClinicDepartment ( Clinic-Department mapping). clinicDepartmentId(PK) 
clinicId,
departmentId 

8. ClinicService ( Clinic-Service mapping ). 
clinicServiceId(PK) 
clinicId,
serviceId 

9. DoctorProfile ( Doctor information ). 
doctorProfileId(PK),
userId,
registrationNo,
Qualification,
Specialization,
experienceYears,
consultationFee,
Bio,
Languages,
Gender,
dob 

10. DoctorDepartment ( Doctor-Department mapping ). doctorDepartmentId(PK)
doctorId,
departmentId 

11. DoctorExperience ( Experience ). 
experienceId(PK)
doctorId,
hospitalName,
Designation,
startDate,
endDate,
description 

12. DoctorAchievement ( Achievements ). 
achievementId(PK) 
doctorId,
Title,
Description,
year 

13. DoctorSchedule ( Schedule ). 
scheduleId(PK) 
doctorId,
clinicId,
dayOfWeek,
startTime,
endTime,
slotDuration,
maximumBooking,
isAvailable 

14. DoctorLeave ( Leave ). 
leaveId(PK) 
doctorId,
fromDate,
toDate,
Reason,
status 

15. StaffProfile Staff. 
staffProfileId(PK) 
userId,
Designation,
Qualification,
joiningDate 

16. PatientProfile Patient profile. 
patientProfileId(PK)
userId,
Dob,
Gender,
bloodGroup,
Height,
Weight,
maritalStatus,
Occupation,
Address,
City,
State,
Country,
emergencyContactName,
emergencyContactNumber 
17. PatientDocument Patient docs. 
documentId(PK) 
patientId,
documentType,
Title,
filePath,
uploadedBy

18. CareTakerProfile Caretaker. 
careTakerProfileId(PK) 
userId,
Occupation,
address 
19. PatientCareTaker Patient-Caretaker mapping. patientCareTakerId(PK) 
patientId,
careTakerId,
Relationship,
isPrimary 
20. Appointment Appointments. 
appointmentId(PK) 
appointmentNumber,
clinicId,
doctorId,
patientId,
departmentId,
appointmentDate,
startTime,
endTime,
visitType,
consultationType,
Reason,
bookedBy,
Status,
remarks 

21. AppointmentStatusHistory Status history. 
historyId(PK) 
appointmentId,
Status,
changedBy,
Remarks,
createdAt 
22. MedicalRecord Clinical notes. 
medicalRecordId(PK) 
appointmentId,
doctorId,
patientId,
chiefComplaint,
History,
diagnosis, 
Notes,
followUpDate 
23. Prescription Prescription header. 
prescriptionId(PK) 
appointmentId,
doctorId,
patientId,
instruction 
24. PrescriptionMedicine Medicines. 
medicineId(PK) 
prescriptionId,
medicineName,
Strength,
Dosage,
Frequency,
duration, 
instruction 
25. Vital Vitals. 
vitalId(PK) 
appointmentId,
Temperature,
Pulse,
Bp,
Height,
Weight,
oxygen 
26. Invoice Invoice. 
invoiceId(PK)
appointmentId,
invoiceNo,
Subtotal,
Discount,
Tax,
Total,
status 
27. InvoiceItem Invoice items. 
invoiceItemId(PK) 
invoiceId,
serviceId,
Description,
Qty,
Price,
amount 

28. Payment Payments. 
paymentId(PK) 
invoiceId,
paymentMethod,
transactionId,
Amount,
Status,
paidAt 
29. ClinicGallery Gallery. 
galleryId(PK) 
clinicId,
Title,
Photo,
uploadedBy
30. Attachment Generic attachments. 
attachmentId(PK) 
Module,
moduleId,
fileName,
filePath,
uploadedBy 
31. Notification Notifications. 
notificationId(PK) 
userId,
Title,
Message,
Type,
isRead 

32. Review Reviews. 
reviewId(PK) 
patientId,
doctorId,
clinicId,
Rating,
Review,
status 
33. ActivityLog Audit. 
activityLogId(PK) 
userId,
Module,
Action,
recordId,
ipAddress,
Device,
createdAt 
34. Setting System settings. 
settingId(PK) 
settingKey,
settingValue,
description 
