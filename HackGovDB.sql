CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE
);

CREATE TABLE Cidadao (
    id_cidadao INT PRIMARY KEY,
    numero_cartao_sus VARCHAR(20) NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Historico (
    id_historico INT PRIMARY KEY,
    id_cidadao INT NOT NULL,
    FOREIGN KEY (id_cidadao) REFERENCES Cidadao(id_cidadao)
);

CREATE TABLE Agendamento (
    id_agendamento INT PRIMARY KEY,
    data_consulta DATE NOT NULL,
    horario TIME NOT NULL,
    status VARCHAR(30),
    especialidade VARCHAR(50) DEFAULT 'clinico_geral'
    id_cidadao INT NOT NULL,
    FOREIGN KEY (id_cidadao) REFERENCES Cidadao(id_cidadao)
);

CREATE TABLE Exame (
    id_exame INT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    resultado VARCHAR(100),
    data_exame DATE,
    id_historico INT NOT NULL,
    FOREIGN KEY (id_historico) REFERENCES Historico(id_historico)
);