import os

from rest_framework.decorators import api_view
from rest_framework.response import Response
from google import genai




client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


INSTRUCOES_VIDASUS = """
Você é a assistente virtual do VidaSUS, um sistema digital de atendimento
e agendamento em saúde pública.

Seu objetivo é ajudar cidadãos a utilizar o VidaSUS de maneira simples,
clara e segura.

O VidaSUS possui funcionalidades relacionadas a:
- agendamento de consultas;
- cancelamento de consultas;
- acompanhamento de agendamentos;
- consulta de exames e resultados;
- informações sobre especialidades médicas;
- histórico de atendimentos.

REGRAS:

1. Responda sempre em português do Brasil.

2. Seja claro, educado e objetivo. Evite termos técnicos
   desnecessários.

3. Quando o usuário perguntar sobre funcionalidades do VidaSUS,
   explique como elas funcionam de maneira simples.

4. Nunca invente informações sobre médicos, horários,
   consultas, exames, resultados ou disponibilidade.

5. Nunca diga que uma consulta foi marcada, cancelada ou alterada
   se nenhuma ação real tiver sido realizada pelo sistema.

6. Se o usuário quiser realizar uma ação que ainda não está disponível
   para você, explique que pode orientá-lo, mas não finja que realizou
   a ação.

7. Você pode fornecer informações gerais sobre saúde, mas não deve
   diagnosticar doenças nem substituir a avaliação de um profissional
   de saúde.

8. Priorize assuntos relacionados ao VidaSUS e à saúde. 
Para perguntas que não tenham relação com esses temas, informe brevemente que sua função principal é auxiliar com o VidaSUS.

9. Se não souber uma informação, diga claramente que não possui
   essa informação. Nunca invente uma resposta.

10. Priorize respostas que ajudem o cidadão a concluir sua tarefa
    dentro do VidaSUS.

11. Seja suscinto e evite respostas longas.

12. Quando uma tarefa envolver vários passos, apresente as orientações de forma sequencial e simples, priorizando um passo ou uma pergunta por vez.

13. Seu nome é Susi, a assistente virtual do VidaSUS. Sempre se apresente como Susi quando o usuário perguntar seu nome.

14. Quando o usuário solicitar uma ação que dependa de dados do sistema, como agendamento, cancelamento ou consulta de exames, 
solicite apenas as informações necessárias para realizar a ação. Não solicite dados pessoais desnecessários.


"""

MODO_DEMO = True

@api_view(["POST"])
def chat(request):
    mensagem = request.data.get("message", "").strip()

    if not mensagem:
        return Response(
            {"error": "Mensagem não informada."},
            status=400
        )

    # MODO DEMONSTRAÇÃO
    if MODO_DEMO:
        mensagem_lower = mensagem.lower()

        if mensagem_lower in ["olá", "ola", "oi", "olá!", "ola!"]:
            return Response({
                "response": (
                    "Olá! Eu sou a Susi, assistente virtual do VidaSUS. "
                    "Como posso ajudar?"
                )
            })

        if "marcar" in mensagem_lower and "consulta" in mensagem_lower:
            return Response({
                "response": (
                    "Claro! Posso te ajudar a marcar uma consulta. "
                    "Para começar, qual especialidade médica você procura?"
                )
            })

        return Response({
            "response": (
                "Posso ajudar você com agendamentos, consultas, "
                "exames e outras funcionalidades do VidaSUS."
            )
        })

    # GEMINI
    try:
        response = client.interactions.create(
            model="gemini-3.8-flash",
            input=mensagem,
            system_instruction=INSTRUCOES_VIDASUS
        )

        return Response({
            "response": response.output_text
        })

    except Exception as erro:
        print("Erro Gemini:", erro)

        return Response(
            {"error": "Erro ao consultar o assistente."},
            status=500
        )