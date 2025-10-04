
import { Question } from './types';

export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvzdtou17UCu8lmOFg9fxVEaLg1FnWcvexCYUZzqNLcUhiE6mZW_OkxeeI874AXZRT/exec';
export const NOME_DESTE_JOGO = "MAT - CAP12";

export const questions: Question[] = [
    { question: 'Em uma loja de brinquedos, um carrinho que custa R$ 50,00 está com 10% de desconto. Qual é o valor do desconto?', options: ['R$ 10,00', 'R$ 5,00', 'R$ 45,00', 'R$ 2,00'], answer: 'R$ 5,00', feedbacks: {'R$ 10,00': 'Incorreto. 10% é o mesmo que dividir por 10, mas R$ 10,00 seria 20% de R$ 50,00, não 10%.', 'R$ 5,00': 'Correto! Para calcular 10% de um valor, basta dividi-lo por 10. R$ 50,00 ÷ 10 = R$ 5,00.', 'R$ 45,00': 'Incorreto. Este é o preço final do carrinho com o desconto, não o valor do desconto em si.', 'R$ 2,00': 'Incorreto. Este valor não corresponde ao cálculo de 10% sobre R$ 50,00.'} },
    { question: 'Numa turma de 40 alunos, 50% são meninas. Quantas meninas há na turma?', options: ['20 meninas', '25 meninas', '10 meninas', '40 meninas'], answer: '20 meninas', feedbacks: {'20 meninas': 'Correto! Calcular 50% de um valor é o mesmo que calcular a metade dele. Metade de 40 é 20.', '25 meninas': 'Incorreto. Lembre-se que 50% representa a metade do total.', '10 meninas': 'Incorreto. 10 meninas representariam 25% da turma, não 50%.', '40 meninas': 'Incorreto. 40 é o número total de alunos, o que corresponde a 100% da turma.'} },
    { question: 'Uma pizza foi dividida em 4 fatias iguais. Se você comer 1 fatia, qual porcentagem da pizza você comeu?', options: ['50%', '10%', '25%', '75%'], answer: '25%', feedbacks: {'50%': 'Incorreto. 50% seria o mesmo que comer metade da pizza, ou seja, 2 fatias.', '10%': 'Incorreto. 10% seria o mesmo que dividir a pizza em 10 partes e comer uma, mas ela foi dividida em 4.', '25%': 'Correto! A pizza inteira é 100%. Se foi dividida em 4 partes iguais, cada parte é 100 ÷ 4 = 25%. Comer 1 fatia corresponde a 25%.', '75%': 'Incorreto. 75% corresponderia a 3 fatias da pizza.'} },
    { question: 'Jorge quer comprar uma bicicleta que custa R$ 300,00. A loja oferece um desconto de 20%. Qual será o valor do desconto?', options: ['R$ 30,00', 'R$ 20,00', 'R$ 60,00', 'R$ 240,00'], answer: 'R$ 60,00', feedbacks: {'R$ 30,00': 'Incorreto. R$ 30,00 seria 10% do valor da bicicleta. Para achar 20%, você pode calcular 10% e multiplicar por 2.', 'R$ 20,00': 'Incorreto. Este valor não corresponde a 20% de R$ 300,00.', 'R$ 60,00': 'Correto! Uma forma de calcular é achar 10% de R$ 300,00 (que é R$ 30,00) e depois multiplicar por 2. R$ 30,00 x 2 = R$ 60,00.', 'R$ 240,00': 'Incorreto. Este é o valor final da bicicleta após o desconto, não o valor do desconto.'} },
    { question: 'Em uma pesquisa com 200 pessoas, 60% disseram que gostam de chocolate. Quantas pessoas gostam de chocolate?', options: ['60 pessoas', '120 pessoas', '80 pessoas', '100 pessoas'], answer: '120 pessoas', feedbacks: {'60 pessoas': 'Incorreto. 60 é o número da porcentagem, não a quantidade de pessoas.', '120 pessoas': 'Correto! Para calcular, você pode achar 10% de 200 (que é 20) e multiplicar por 6. 20 x 6 = 120.', '80 pessoas': 'Incorreto. Este é o número de pessoas que não gostam de chocolate (40%).', '100 pessoas': 'Incorreto. 100 pessoas seria 50% do total.'} },
    { question: 'Jorge quer comprar uma bicicleta que custa R$ 300,00. A loja oferece um desconto de 12%. Qual é o valor do desconto em reais?', type: 'input', answer: '36' },
    { question: 'Em uma escola com 600 alunos, 15% faltaram na sexta-feira. Quantos alunos faltaram?', type: 'input', answer: '90' },
    { question: 'Numa turma de 120 alunos, 70% preferem futebol. Quantos alunos preferem futebol?', type: 'input', answer: '84' },
    { question: 'Uma pesquisa foi realizada com 200 alunos e 60% eram meninos. Qual é a quantidade de meninos entrevistados?', type: 'input', answer: '120' },
    { question: 'Um bolo de chocolate custa R$ 18,00. Quanto custa um pedaço que corresponde a 50% do bolo?', type: 'input', answer: '9' },
    { question: 'Em um povoado com 800 moradores, 25% da população não é alfabetizada. Quantos moradores não são alfabetizados?', type: 'input', answer: '200' },
    { question: 'Thiago quer comprar um videogame de R$ 900,00. Ele terá um desconto de 16% se pagar à vista. Qual é o valor do desconto em reais?', type: 'input', answer: '144' },
    { question: 'Se você precisa calcular 35% de 400, qual será o resultado?', type: 'input', answer: '140' },
    { question: 'Uma conta de R$ 50,00 teve um aumento de 2,4%. Qual foi o valor do aumento em reais?', type: 'input', answer: '1.20' },
    { question: 'Calcule 75% de 40.', type: 'input', answer: '30' },
    { question: 'Em uma turma de 40 alunos, 50% são meninas. Quantas meninas há na turma?', type: 'input', answer: '20' },
    { question: 'Quanto é 60% de 50?', type: 'input', answer: '30' },
    { question: 'Um carrinho de brinquedo custa R$ 50,00 e está com 10% de desconto. Qual o valor do desconto em reais?', type: 'input', answer: '5' },
    { question: 'Calcule 45% de 200.', type: 'input', answer: '90' },
    { question: 'Mônica tinha uma conta de R$ 378,00 e pagou uma multa de 6% por atraso. Qual foi o valor da multa em reais?', type: 'input', answer: '22.68' },
    { question: 'Uma loja de artigos esportivos está com uma promoção de 20% de desconto. Se um skate custa R$ 200,00, qual é o valor do desconto?', type: 'input', answer: '40' },
    { question: 'Calcule 1% de 1400.', type: 'input', answer: '14' },
    { question: 'Numa bandeja com 20 frutas no total, 40% são frutas cítricas. Quantas são as frutas cítricas?', type: 'input', answer: '8' },
    { question: 'Se 10% de um valor é 75, quanto é 50% desse mesmo valor?', type: 'input', answer: '375' },
    { question: 'Raquel comprou roupas no valor de R$ 239,00 e ganhou 5% de desconto por pagar à vista. Qual foi o valor do desconto em reais?', type: 'input', answer: '11.95' }
];
