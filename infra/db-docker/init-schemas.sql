CREATE DATABASE chat_system;

\c chat_system
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS "localhost";
CREATE SCHEMA IF NOT EXISTS "platform";

ALTER DATABASE chat_system SET pg_trgm.similarity_threshold = 0.3;