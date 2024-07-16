$(document).ready(function () {
    var answers = [];
    var currentIndex = 0;

    // 获取题目
    $.ajax({
        type: "get",
        url: `./data/output.txt`,
        async: false,
        success: function (data) {
            var data = JSON.parse(data);
            let questionIndex = 0; // 用于累计所有部分的问题编号

            data.forEach((step, stepIndex) => {
                step.questions.forEach((item, index) => {
                    let display = stepIndex === 0 && index === 0 ? "block" : "none";
                    questionIndex++; // 增加问题编号

                    let questionHtml = `
                    <form class="ac-custom ac-radio ac-circle" autocomplete="off" style="display: ${display}">
                        <h2>${questionIndex}.${item.question}</h2>
                        <ul>`;
                    
                    item.choices.forEach((choice, choiceIndex) => {
                        questionHtml += `
                        <li>
                            <input id="choice_${stepIndex}_${index}_${choiceIndex}" name="answer_${stepIndex}_${index}" value="${choice.value}" type="radio">
                            <label for="choice_${stepIndex}_${index}_${choiceIndex}">
                                ${choice.text}
                            </label>
                            <svg viewBox="0 0 100 100"></svg>
                        </li>`;
                    });

                    questionHtml += `
                        </ul>
                        <button type="button" class="btn btn-secondary back-button">上一題</button>
                    </form>`;

                    $("#skintypequestion").append(questionHtml);
                });
            });

            // 等待页面渲染完成后插入 svgcheckbx.js
            $("body").append("<script src='./static/js/svgcheckbx.js'></script>");
        }
    });

    function showForm(index) {
        $("#skintypequestion form").hide();
        $($("#skintypequestion form")[index]).show();
    }

    $("body").on("change", "input[name^='answer_']", function () {
        var answer = parseFloat($(this).val());
        answers[currentIndex] = answer;

        var form = $(this).closest("form");
        var next_form = form.next();
        currentIndex++;

        setTimeout(function () {
            form.hide();
            next_form.show();
        }, 520);

        if (currentIndex == 65) { // 根据总问题数修改
            var result = calculateSkinType(answers);
            $("#result").text(result);

            // 设置进度条的值和显示
            var scores = calculateScores(answers);
            $("#progress1").css("width", scores[0] * 100 / 44 + "%").attr("aria-valuenow", scores[0]);
            $("#progress2").css("width", scores[1] * 100 / 77 + "%").attr("aria-valuenow", scores[1]);
            $("#progress3").css("width", scores[2] * 100 / 57 + "%").attr("aria-valuenow", scores[2]);
            $("#progress4").css("width", scores[3] * 100 / 85 + "%").attr("aria-valuenow", scores[3]);

            $("#skintypequestion").hide();
            $("#resultbox").show();
        }
    });

    $("body").on("click", ".back-button", function () {
        if (currentIndex > 0) {
            currentIndex--;
            showForm(currentIndex);

            // 清除当前选中的答案状态
            $(`input[name='answer_${Math.floor(currentIndex / 11)}_${currentIndex % 11}']`).prop('checked', false);
        }
    });

    function calculateSkinType(answer_list) {
        // 分成四部分分别计算
        var part1 = answer_list.slice(0, 11);
        var part2 = answer_list.slice(11, 30);
        var part3 = answer_list.slice(30, 44);
        var part4 = answer_list.slice(44, 65);

        var score1 = part1.reduce((a, b) => a + b, 0);
        var score2 = part2.reduce((a, b) => a + b, 0);
        var score3 = part3.reduce((a, b) => a + b, 0);
        var score4 = part4.reduce((a, b) => a + b, 0);

        var letter1 = score1 <= 26 ? 'D' : 'O';
        var letter2 = score2 <= 29 ? 'R' : 'S';
        var letter3 = score3 <= 28 ? 'N' : 'P';
        var letter4 = score4 <= 40 ? 'T' : 'W';

        return letter1 + letter2 + letter3 + letter4;
    }

    function calculateScores(answer_list) {
        var part1 = answer_list.slice(0, 11);
        var part2 = answer_list.slice(11, 30);
        var part3 = answer_list.slice(30, 44);
        var part4 = answer_list.slice(44, 65);
        
        var score1 = part1.reduce((a, b) => a + b, 0);
        var score2 = part2.reduce((a, b) => a + b, 0);
        var score3 = part3.reduce((a, b) => a + b, 0);
        var score4 = part4.reduce((a, b) => a + b, 0);

        return [score1, score2, score3, score4];
    }
});
