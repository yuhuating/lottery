var ALL_USERS = [];
var ALL_AWARDS = [];
var g_Interval = 50;
var g_Timer;    // 抽奖程序定时器
var g_winner = null;
var g_award = null;
var running = false;

//跑马灯音效
var runingmic = document.getElementById("runingmic");
runingmic.volume = 0.5;

//中奖音效
var pausemic = document.getElementById("pausemic");
pausemic.volume = 1.0;

UpdateUserList();      // 更新抽奖名单
UpdateAwardList();     // 更新奖品列表
UpdateWinnerList();    // 更新中奖名单


function beginRndNum(trigger) {
    if (running) {
        running = false;
        runingmic.pause();      // 停止抽奖音乐
        pausemic.play();        // 播放庆祝音乐
        clearTimeout(g_Timer);  // 停止抽奖滚动条
        $(trigger).val("开始");
        $('#ResultNum').css('color', 'red');

        WinAward(g_winner.name, g_award.tag);   // 提交中奖名单
        UpdateUserList();                       // 更新抽奖名单
        UpdateAwardList();                      // 更新奖品列表
        UpdateWinnerList();                     // 更新中奖名单
        UpdateCurrentAward(g_award.tag);        // 更新当前奖品

    }
    else {
        if (g_award == null) {
            layer.alert('老板，奖品都没选，这是要干啥了？', {icon: 5});
            return GameOver();
        }
        else if (ALL_USERS.length == 0) {
            layer.alert("所有人都中奖了，老板还要继续抽奖吗？", {icon: 5});
            return GameOver();
        }
        else if (g_award.count <= 0) {
            layer.alert("老板，奖品都没了，还要继续吗？", {icon: 5});
            return GameOver();
        }
        pausemic.pause();       // 停止庆祝音乐
        runingmic.play();       // 开始抽奖音乐
        running = true;
        $('#ResultNum').css('color', 'black');
        $(trigger).val("停止");
        beginTimer();
    }
}

// 关键地方
function UpdateName() {
    var g_PersonCount = ALL_USERS.length;   //参加抽奖人数
    var num = Math.floor(Math.random() * g_PersonCount);
    g_winner = ALL_USERS[num];
    $('#ResultNum').html(g_winner.name);
}

function beginTimer() {
    g_Timer = setTimeout(beat, g_Interval);
}

function beat() {
    g_Timer = setTimeout(beat, g_Interval);
    UpdateName();
}

// 关闭异步
function UpdateUserList() {
    $.ajax({
        url: "/users",
        type: "GET",
        async: false,
        success: function (result) {
            ALL_USERS = result.data;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        },
        complete: function (XMLHttpRequest, textStatus) {
        }
    })
}
// 关闭异步
function UpdateWinnerList() {
    $.ajax({
        url: "/winner",
        type: "GET",
        async: false,
        success: function (result) {
            var winners = result.data;
            var winner_list = $("#winner-list");
            winner_list.find('a').remove();
            for (var i = 0; i < winners.length; i++) {
                var w = winners[i];
                var content = '<a name='+ w.name +' class="list-group-item">' + w.name + '<span class="badge">' + w.awards + '</span></a>';
                winner_list.append(content);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        },
        complete: function (XMLHttpRequest, textStatus) {
        }
    })
}


function UpdateAwardList() {
    $.ajax({
        url: "/awards",
        type: "GET",
        async: false,
        success: function (result) {
            var awards_list = $("#awards-list");
            awards_list.find('a').remove();
            ALL_AWARDS = result.data;
            for (var i = 0; i < ALL_AWARDS.length; i++) {
                var w = ALL_AWARDS[i];
                var content = '<a name=' + w.tag + ' class="list-group-item">' + w.tag + '<span class="badge">' + w.count + '</span></a>';
                awards_list.append(content);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        },
        complete: function (XMLHttpRequest, textStatus) {
        }
    })
}

$("#awards-list").on("click", 'a', function () {
    var name = $(this).attr("name");
    UpdateCurrentAward(name);
});

$("#winner-list").on("click", 'a', function () {
    var name = $(this).attr("name");
    layer.confirm('撤销奖品？？？', {
            icon: 0,
            btn: ['确定', '取消'] //按钮
        }, function () {
            layer.msg('悲催！！！！', {icon: 0});
            Revoke(name);   //撤销奖项
        }, function () {
            layer.msg('吓死宝宝了！！！！', {icon: 1})
        });
});


$(document).bind("keydown", function (ev) {
    if (ev.keyCode == 13) {     // 按回车
        $('#btn').click();
    }
    else if (ev.keyCode == 49) {     // 按1
        $('#myModal').modal('toggle');
    }

    else if (ev.keyCode == 48) {     // 按0
        layer.confirm('确定要重置数据？？？',{
            icon: 1,
            btn: ['确定', '取消'] //按钮
        }, function () {
            Reset();   //数据重置
        }, function () {
        });

    }
});


function UpdateCurrentAward(tag) {
    var result = null;
    for (var i = 0; i < ALL_AWARDS.length; i++) {
        var w = ALL_AWARDS[i];
        if (w.tag == tag) {
            result = w;
            break
        }
    }
    g_award = result;

    $("#award-tag").text(g_award.tag);
    $("#award-count").text(g_award.count);
}


function WinAward(name, awards) {
    $.ajax({
        url: "/win",
        type: "POST",
        data: {"name": name, "awards": awards},
        success: function (result) {
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        },
        complete: function (XMLHttpRequest, textStatus) {
        }
    })
}

// 恢复出厂数据
function Revoke(name) {
    $.ajax({
        url: "/revoke",
        type: "POST",
        data: {"name": name},
        success: function (result) {
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        },
        complete: function (XMLHttpRequest, textStatus) {
            window.location.reload();//刷新当前页面.
        }
    })
}

// 恢复出厂数据
function Reset() {
    $.ajax({
        url: "/reset",
        type: "GET",
        success: function (result) {
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        },
        complete: function (XMLHttpRequest, textStatus) {
            window.location.reload();//刷新当前页面.
        }
    })
}

function GameOver() {
    $('#ResultNum').css('color', 'black');
    $('#ResultNum').html("*****");
}