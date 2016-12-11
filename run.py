# coding: utf-8
import os
import utils
from bottle import Bottle, run, request, static_file
CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))

app = Bottle()


# index
@app.route('/')
def index():
    return static_file("index.html", os.path.join(CURRENT_DIR, "templates"))


# 更新
@app.route('/win', method='POST')
def win():
    name = request.forms.get("name", None)
    awards = request.forms.get("awards", None)
    result = utils.win(name, awards)
    return result


# 撤销
@app.route('/revoke', method='POST')
def revoke():
    name = request.forms.get("name", None)
    result = utils.revoke(name)
    return result


# 待抽奖用户列表
@app.route('/users')
def users():
    return dict(data=utils.users())


# 中奖用户列表
@app.route('/winner')
def winner():
    return dict(data=utils.winner())


# 奖品
@app.route('/awards')
def awards():
    return dict(data=utils.awards())


# 重置
@app.route('/reset')
def reset():
    return utils.reset()

# 静态文件
@app.route('/static/<path:path>')
def callback(path):
    return static_file(path, os.path.join(CURRENT_DIR, "static"))

if __name__ == '__main__':
    app.run(debug=True, port=80)

