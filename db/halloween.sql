CREATE DATABASE IF NOT EXISTS halloween CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE halloween;

CREATE TABLE disfraces (
  id INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  votos INT(11) NOT NULL DEFAULT 0,
  foto VARCHAR(20) NOT NULL DEFAULT '',
  foto_blob BLOB NULL,
  eliminado INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

CREATE TABLE usuarios (
  id INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  clave TEXT NOT NULL,
  es_admin TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_nombre (nombre)
);

CREATE TABLE votos (
  id INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) NOT NULL,
  id_disfraz INT(11) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_voto (id_usuario, id_disfraz),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_disfraz) REFERENCES disfraces(id)
);

INSERT INTO disfraces (nombre, descripcion, foto) VALUES
('Vampiro Edward', 'Vampiro', 'vampiro.jpg'),
('Katy Perry', 'Look de Katy Perry en California Gurls.', 'katy.jpg'),
('Venado y Cazador', 'La venado y su cazador.', 'venado.jpg'),
('Árabe', 'Túnica', 'arabe.jpg');