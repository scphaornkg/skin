$(document).ready(function () {
    var answers = [];

    // 获取题目
    $.ajax({
        type: "get",
        url: `./data/output.txt`,
        async: false,
        success: function (data) {
            var data = JSON.parse(data);
            data.forEach((item, index) => {
                let display = index === 0 ? "block" : "none";

                $("#skintypequestion").append(`
                    <form class="ac-custom ac-radio ac-circle" autocomplete="off" style="display: ${display}">
                        <h2>${index + 1}.${item.question}</h2>
                        <ul>
                            <li>
                                <input id="choice_a_${index}" name="answer_${index}" value="${item.choice_a.value}" type="radio">
                                <label for="choice_a_${index}">
                                    ${item.choice_a.text}
                                </label>
                                <svg viewBox="0 0 100 100"></svg>
                            </li>
                            <li>
                                <input id="choice_b_${index}" name="answer_${index}" value="${item.choice_b.value}" type="radio">
                                <label for="choice_b_${index}">
                                    ${item.choice_b.text}
                                </label>
                                <svg viewBox="0 0 100 100"></svg>
                            </li>
                            ${item.choice_c ? `
                            <li>
                                <input id="choice_c_${index}" name="answer_${index}" value="${item.choice_c.value}" type="radio">
                                <label for="choice_c_${index}">
                                    ${item.choice_c.text}
                                </label>
                                <svg viewBox="0 0 100 100"></svg>
                            </li>` : ''}
                            ${item.choice_d ? `
                            <li>
                                <input id="choice_d_${index}" name="answer_${index}" value="${item.choice_d.value}" type="radio">
                                <label for="choice_d_${index}">
                                    ${item.choice_d.text}
                                </label>
                                <svg viewBox="0 0 100 100"></svg>
                            </li>` : ''}
                            ${item.choice_e ? `
                            <li>
                                <input id="choice_e_${index}" name="answer_${index}" value="${item.choice_e.value}" type="radio">
                                <label for="choice_e_${index}">
                                    ${item.choice_e.text}
                                </label>
                                <svg viewBox="0 0 100 100"></svg>
                            </li>` : ''}
                        </ul>
                    </form>`
                );
            });

            // 等待页面渲染完成后插入 svgcheckbx.js
            $("body").append("<script src='./static/js/svgcheckbx.js'></script>");
        }
    });

    $("body").on("change", "input[name^='answer_']", function () {
        var answer = parseFloat($(this).val());
        answers.push(answer);

        var form = $(this).closest("form");
        var next_form = form.next();
        setTimeout(function () {
            form.remove();
            next_form.css("display", "block");
        }, 520);
        
        if (answers.length == 18) {
            var result = calculateSkinType(answers);
            $("#result").text(result);

            // 设置进度条的值和显示
            var scores = calculateScores(answers);
            $("#progress1").css("width", scores[0] * 100 / 16 + "%").attr("aria-valuenow", scores[0]);
            $("#progress2").css("width", scores[1] * 100 / 16 + "%").attr("aria-valuenow", scores[1]);
            $("#progress3").css("width", scores[2] * 100 / 16 + "%").attr("aria-valuenow", scores[2]);
            $("#progress4").css("width", scores[3] * 100 / 16 + "%").attr("aria-valuenow", scores[3]);


            $("#skintypequestion").hide();
            $("#resultbox").show();
        }
    });

    function calculateSkinType(answer_list) {
        // 分成四部分分别计算
        var part1 = answer_list.slice(0, 4);
        var part2 = answer_list.slice(4, 8);
        var part3 = answer_list.slice(8, 13);
        var part4 = answer_list.slice(13, 18);

        var score1 = part1.reduce((a, b) => a + b, 0);
        var score2 = part2.reduce((a, b) => a + b, 0);
        var score3 = part3.reduce((a, b) => a + b, 0);
        var score4 = part4.reduce((a, b) => a + b, 0);

        var letter1 = score1 <= 10 ? 'D' : 'O';
        var letter2 = score2 <= 10 ? 'R' : 'S';
        var letter3 = score3 <= 10 ? 'N' : 'P';
        var letter4 = score4 <= 10 ? 'T' : 'W';

        return letter1 + letter2 + letter3 + letter4;
    }

    function calculateScores(answer_list) {
        var part1 = answer_list.slice(0, 4);
        var part2 = answer_list.slice(4, 8);
        var part3 = answer_list.slice(8, 13);
        var part4 = answer_list.slice(13, 18);

        var score1 = part1.reduce((a, b) => a + b, 0);
        var score2 = part2.reduce((a, b) => a + b, 0);
        var score3 = part3.reduce((a, b) => a + b, 0);
        var score4 = part4.reduce((a, b) => a + b, 0);

        return [score1, score2, score3, score4];
    }
});
