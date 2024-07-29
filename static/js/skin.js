$(document).ready(function () {
    var answers = [];
    var currentIndex = 0;

    // 介绍页面内容
    var intros = [
        {
            title: "乾性 or 油性",
            content: "經常“油光滿面”就是油性肌膚嗎?\n也有可能是肌膚缺水太乾導致。\n\n我們將根據測試結果對你的皮膚類型進行精確判斷\n找到你皮膚問題的主導因素還將告訴你可能面臨的皮膚問題"
        },
        {
            title: "敏感性 or 耐受性",
            content: "敏感肌就一定要處處小心避雷嗎?耐受肌就一定不會刺激過敏嗎?\n\n我們將根據測試結果對你的肌膚類型進行精確劃分\n幫助你瞭解精確膚質類型 找到正確的護膚手段"
        },
        {
            title: "色素性 or 非色素性",
            content: "皮膚不長斑點就意味著自己是非色素性肌膚嗎?除了防曬還有什麼辦法可以預防肌膚色素沉著?\n\n我們將根據測試結果對你的肌膚類型進行精確劃分\n幫助你找到相應措施來預防皮膚色素沉著 保護肌膚健康狀態"
        },
        {
            title: "皺紋 or 緊致",
            content: "皺紋性皮膚更易衰老不可逆?\n通過科學的保養護理進行干預，皺紋性也能轉變為緊致性。\n\n對你的肌膚類型進行精確劃分\n幫助你準確瞭解自己的肌膚本源狀態 有效對抗肌膚老化恢復緊致狀態"
        }
    ];

    // 生成介绍页面
    intros.forEach((intro, index) => {
        let display = index === 0 ? "block" : "none";
        let introHtml = `
        <div class="intro-page text-center d-flex flex-column justify-content-center align-items-center" style="height: 90vh; display: ${display}" data-intro-index="${index}">
            <h1 class="display-4">${intro.title}</h1>
            <br>
            <p class="lead">${intro.content.replace(/\n/g, '<br>')}</p>
            <button type="button" class="btn btn-primary mt-4 continue-button">測一測</button>
        </div>`;
        $("#skintypequestion").append(introHtml);
    });

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
                    let display = "none";
                    questionIndex++; // 增加问题编号

                    let questionHtml = `
                    <form class="ac-custom ac-radio ac-circle question-form" autocomplete="off" style="display: ${display}" data-step-index="${stepIndex}">
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
                        <button type="button" class="btn btn-secondary back-button">返回上一题</button>
                    </form>`;

                    $("#skintypequestion").append(questionHtml);
                });
            });

            // 等待页面渲染完成后插入 svgcheckbx.js
            $("body").append("<script src='./static/js/svgcheckbx.js'></script>");
        }
    });

    function showForm(index) {
        $("#skintypequestion form, .intro-page").hide();
        $($("#skintypequestion form")[index]).show();
    }

    function showIntro(index) {
        $("#skintypequestion form, .intro-page").hide();
        $(`.intro-page[data-intro-index="${index}"]`).show();
    }

    $("body").on("click", ".continue-button", function () {
        showForm(currentIndex);
    });

    $("body").on("change", "input[name^='answer_']", function () {
        var answer = parseFloat($(this).val());
        answers[currentIndex] = answer;

        var form = $(this).closest("form");
        var next_form = form.nextAll("form.question-form").first();
        var stepIndex = form.data("step-index");

        // 使用 setTimeout 来延迟切换页面，以便动画可以显示
        setTimeout(function () {
            if (next_form.length === 0 || next_form.data("step-index") !== stepIndex) {
                currentIndex++;
                showIntro(stepIndex + 1);
            } else {
                currentIndex++;
                form.hide();
                next_form.show();
            }

            if (currentIndex == 65) { // 根据总问题数修改
                var result = calculateSkinType(answers);
                $("#result").text(result);
                $("#resultDescription").text(skinTypeDescriptions[result]);

                // 设置进度条的值和显示
                var scores = calculateScores(answers);
                $("#progress1").css("width", scores[0] * 100 / 44 + "%").attr("aria-valuenow", scores[0]);
                $("#progress2").css("width", scores[1] * 100 / 77 + "%").attr("aria-valuenow", scores[1]);
                $("#progress3").css("width", scores[2] * 100 / 57 + "%").attr("aria-valuenow", scores[2]);
                $("#progress4").css("width", scores[3] * 100 / 85 + "%").attr("aria-valuenow", scores[3]);
                
                $("#progress1-label").text(scores[0] <= 26 ? '乾性' : '油性');
                $("#progress2-label").text(scores[1] <= 29 ? '耐受性' : '敏感性');
                $("#progress3-label").text(scores[2] <= 28 ? '非色素性' : '色素性');
                $("#progress4-label").text(scores[3] <= 40 ? '緊致性' : '皺紋性');
                $("#skintypequestion").hide();
                $("#resultbox").show();
            }
        }, 500); // 延迟500毫秒以便动画显示
    });

    $("body").on("click", ".back-button", function () {
        if (currentIndex > 0) {
            currentIndex--;
            showForm(currentIndex);

            // 清除当前选中的答案状态
            $(`input[name='answer_${Math.floor(currentIndex / 11)}_${currentIndex % 11}']`).prop('checked', false);
        }
    });

    const skinTypeDescriptions = {
        "ORPW": "塑料姐妹花的",
        "ORNT": "女神般皮膚的",
        "ORPT": "神采飛揚的",
        "ORNW": "光芒四射的",
        "OSPT": "最會來事的",
        "OSNW": "永遠在臉紅的",
        "OSNT": "永遠長不大的",
        "OSPW": "能曬出古銅色的",
        "DRPW": "没有安全感的",
        "DRNT": "矜氣公主般的",
        "DRPT": "活在當下的",
        "DRNW": "易燃易爆的",
        "DSPT": "沒有安全感的",
        "DSNW": "嬌氣公主般的",
        "DSNT": "易燃易爆的",
        "DSPW": "活在常下的"
    };
    

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
