# Database Migrations

This directory contains SQL migration scripts for database schema changes.

## Migration Files

### add_otp_and_phone_verification.sql
- Creates `otps` table for storing OTP codes
- Adds `phone_verified` column to `users` table
- Creates indexes for better query performance

## How to Apply Migrations

### Option 1: Automatic (Using Spring Boot JPA)
If `spring.jpa.hibernate.ddl-auto=update` is set in `application.properties`, 
Hibernate will automatically create/update the database schema when the application starts.

### Option 2: Manual (Using psql or pgAdmin)
1. Connect to your PostgreSQL database
2. Run the SQL migration file:
   ```bash
   psql -U postgres -d oli -f src/main/resources/db/migration/add_otp_and_phone_verification.sql
   ```

### Option 3: Using Flyway (If configured)
If you have Flyway configured, place migrations in `db/migration/` directory 
and they will be applied automatically on application startup.

## Notes
- Make sure to backup your database before running migrations
- Test migrations in a development environment first
- The migration checks for table/column existence before creating/altering to avoid errors

