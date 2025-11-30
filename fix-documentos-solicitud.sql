-- Script SQL para cambiar el tipo de columna documentosSolicitud a LONGTEXT
-- Ejecuta este script en tu base de datos MySQL

ALTER TABLE adopciones MODIFY COLUMN documentosSolicitud LONGTEXT;

