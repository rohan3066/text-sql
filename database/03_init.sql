-- Create read-only user for analytics
CREATE USER IF NOT EXISTS 'textsql_reader'@'%' IDENTIFIED WITH mysql_native_password BY 'readerpassword';
GRANT SELECT ON ecommerce_db.* TO 'textsql_reader'@'%';

-- Create admin user for application system tables (e.g. users, history, saved queries)
CREATE USER IF NOT EXISTS 'textsql_admin'@'%' IDENTIFIED WITH mysql_native_password BY 'adminpassword';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'textsql_admin'@'%';

FLUSH PRIVILEGES;
