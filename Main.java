import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

enum Especialidade {
    CLINICO_GERAL, CARDIOLOGIA, PEDIATRIA, ORTOPEDIA, DERMATOLOGIA;

    @Override
    public String toString() {
        return name().charAt(0) + name().substring(1).toLowerCase().replace('_', ' ');
    }
}

class Usuario {
    String nome;
    String cpf;
    String telefone;

    public Usuario(String nome, String cpf, String telefone) {
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
    }
}

class Cidadao extends Usuario {
    String numeroCartaoSUS;
    List<Agendamento> agendamentos = new ArrayList<>();
    Historico historico = new Historico();

    public Cidadao(String nome, String cpf, String telefone, String numeroCartaoSUS) {
        super(nome, cpf, telefone);
        this.numeroCartaoSUS = numeroCartaoSUS;
    }

    public void agendarConsulta(Agendamento agendamento) {
        agendamentos.add(agendamento);
        System.out.println("  Agendamento criado: " + agendamento.especialidade + " em " + agendamento.data + " as " + agendamento.horario);
    }

    public void verHistorico() {
        historico.listarExames();
    }
}

class Agendamento {
    String data;
    String horario;
    String status;
    Especialidade especialidade;

    public Agendamento(String data, String horario, Especialidade especialidade) {
        this.data = data;
        this.horario = horario;
        this.especialidade = especialidade;
        this.status = "Pendente";
    }

    public void confirmar() { status = "Confirmado"; }
    public void cancelar()  { status = "Cancelado";  }
}

class Exame {
    String tipo;
    String resultado;
    String data;

    public Exame(String tipo, String resultado, String data) {
        this.tipo = tipo;
        this.resultado = resultado;
        this.data = data;
    }
}

class Historico {
    List<Exame> exames = new ArrayList<>();

    public void adicionarExame(Exame exame) { exames.add(exame); }

    public void listarExames() {
        System.out.println("  Exames do historico:");
        for (Exame e : exames) {
            System.out.println("    * " + e.tipo + " - " + e.resultado + " (" + e.data + ")");
        }
    }
}

public class Main {
    public static void main(String[] args) {

        System.out.println("\n=== VidaSUS - Demonstracao do Sistema ===\n");

        // 1. Criar cidadaos
        Cidadao joao  = new Cidadao("Joao Silva",   "12345678900", "11999990001", "SUS123");
        Cidadao maria = new Cidadao("Maria Souza",  "98765432100", "11999990002", "SUS456");

        System.out.println(">> Criando agendamentos para Joao Silva:");
        Agendamento ag1 = new Agendamento("2025-05-20", "09:00", Especialidade.CARDIOLOGIA);
        Agendamento ag2 = new Agendamento("2025-05-22", "14:00", Especialidade.CLINICO_GERAL);
        Agendamento ag3 = new Agendamento("2025-05-25", "11:00", Especialidade.DERMATOLOGIA);
        joao.agendarConsulta(ag1);
        joao.agendarConsulta(ag2);
        joao.agendarConsulta(ag3);

        System.out.println("\n>> Criando agendamentos para Maria Souza:");
        Agendamento ag4 = new Agendamento("2025-05-21", "10:30", Especialidade.PEDIATRIA);
        Agendamento ag5 = new Agendamento("2025-05-23", "08:00", Especialidade.ORTOPEDIA);
        maria.agendarConsulta(ag4);
        maria.agendarConsulta(ag5);

        // 2. Confirmar e cancelar
        System.out.println("\n>> Atualizando status:");
        ag1.confirmar(); System.out.println("  ag1 Cardiologia   -> " + ag1.status);
        ag4.cancelar();  System.out.println("  ag4 Pediatria     -> " + ag4.status);
        ag5.confirmar(); System.out.println("  ag5 Ortopedia     -> " + ag5.status);

        // 3. Exames no historico de Joao
        joao.historico.adicionarExame(new Exame("Hemograma", "Normal",    "2025-03-10"));
        joao.historico.adicionarExame(new Exame("Glicemia",  "108 mg/dL", "2025-03-10"));
        System.out.println("\n>> Historico de Joao Silva:");
        joao.verHistorico();

    }
}
