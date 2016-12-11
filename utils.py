# coding: utf-8
import os
from tinydb import TinyDB,  where

CURRENT_DIR = os.path.abspath(os.path.dirname(__file__))
db = TinyDB(os.path.join(CURRENT_DIR, "db.json"))
t_awards = db.table('awards')
t_users = db.table('users')


def users():
    t_users.clear_cache()
    return t_users.search(where("awards") == None)


def winner():
    t_users.clear_cache()
    return t_users.search(where("awards") != None)


def win(name, tag):
    t_users.clear_cache()   # 清除缓存
    t_awards.clear_cache()  # 清除缓存

    user = t_users.get(where("name") == name)
    if not user:
        return {"status": 0, "msg": u"用户不存在！"}

    award = t_awards.get(where("tag") == tag)
    if not award:
        return {"status": 0, "msg": u"奖品不存在！"}

    count = award["count"] - 1
    if count < 0:
        return {"status": 0, "msg": u"奖品已抽完！"}

    t_users.update({"awards": tag}, where("name") == name)
    t_awards.update({"count": count}, where("tag") == tag)
    return {"status": 1, "msg": "success"}


def revoke(name):
    t_users.clear_cache()   # 清除缓存
    t_awards.clear_cache()  # 清除缓存

    user = t_users.get(where("name") == name)
    if not user:
        return {"status": 0, "msg": u"用户不存在！"}

    award = t_awards.get(where("tag") == user["awards"])
    if not award:
        return {"status": 0, "msg": u"奖品不存在！"}

    count = award["count"] + 1
    if count > award["total"]:
        return {"status": 0, "msg": u"非法奖品操作！"}

    t_users.update({"awards": None}, where("name") == name)
    t_awards.update({"count": count}, where("tag") == user["awards"])
    return {"status": 1, "msg": "success"}


def awards():
    t_awards.clear_cache()
    return t_awards.all()


# 重置
def reset():
    t_awards.purge()
    t_users.purge()
    all_user = ["张飞", "刘备", "关羽", "曹操", "诸葛亮", "周瑜", "黄盖"]

    all_awards = [{"total": 1, "tag": u"iPhone", "count": 1},
                  {"total": 1, "tag": u"投影仪", "count": 1},
                  {"total": 1, "tag": u"Kindle", "count": 1},
                  {"total": 1, "tag": u"扫地机器人", "count": 1},
                  {"total": 1, "tag": u"无线耳机", "count": 1},
                  {"total": 1, "tag": u"洗碗机", "count": 1},
                  {"total": 1, "tag": u"运动相机", "count": 1},
                  {"total": 10, "tag": u"小米手环", "count": 10},
                  {"total": 1, "tag": u"XBOX", "count": 1}
                  ]

    for user_name in all_user:
        t_users.insert({"name": user_name, "awards": None})

    for award in all_awards:
        t_awards.insert(award)

    return {"status": 1, "msg": "success"}

if __name__ == "__main__":
    reset()
