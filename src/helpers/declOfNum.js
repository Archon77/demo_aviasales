/**
 * Функция склонения числительных в русском языке
 * 'Я знаю 'declOfNum(5, ['иностранный язык', 'иностранных языка', 'иностранных языков']);
 * @param number
 * @param titles
 */

export default function (number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number%100 > 4 && number %100 < 20) ? 2 : cases[Math.min(number%10, 5)] ];
}