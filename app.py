from flask import Flask
from flask import jsonify
from flask import request
import sqlite3
import json
app = Flask(__name__)
DB = "./data/home.db"
@app.route('/')
def hello_world():
    return jsonify({'name':'Haven',
                    'greeting':'Hello World!'})

@app.route('/all-county-rating')
def county_rating():
    #abs(random() % 1000)/100.0 as
    conn = sqlite3.connect( DB )
    conn.row_factory = sqlite3.Row # This enables column access by name: row['column_name']
    db = conn.cursor()
    rows = db.execute("SELECT id,county,state,rate from counties").fetchall()
    conn.close()
    return json.dumps( [dict(ix) for ix in rows] ) #CREATE JSON


@app.route('/search-county')
def search_county():
    #abs(random() % 1000)/100.0 as
    if request.args:
        args=request.args
        sql="SELECT id,county,state,job*{job}+edu*{edu}+health*{health}+col*{col}+traffic*{traffic}+safety*{safety} as rate from counties"\
            .format(job=args["job"],edu=args["edu"],health=args["health"],
             col=args["col"],traffic=args["traffic"],safety=args["safety"])
        print(sql)

    conn = sqlite3.connect( DB )
    conn.row_factory = sqlite3.Row # This enables column access by name: row['column_name']
    db = conn.cursor()
    rows = db.execute(sql).fetchall()
    conn.close()
    #return jsonify(rows)
    #print(rows[0][0],rows[0][1],rows[0][2])
    #return[jsonify(ix) for ix in rows]
    return json.dumps( [dict(ix) for ix in rows] ) #CREATE JSON

@app.route('/search-similar-county')
def search_similar_county():

    if request.args:
        args=request.args

    print(args)

    sql="SELECT id,county,state,{cluster} as cluster_id from counties".format(cluster=args['q'])

    conn = sqlite3.connect( DB )
    conn.row_factory = sqlite3.Row # This enables column access by name: row['column_name']
    db = conn.cursor()
    rows = db.execute(sql).fetchall()
    conn.close()
    #return jsonify(rows)
    #print(rows[0][0],rows[0][1],rows[0][2])
    #return[jsonify(ix) for ix in rows]
    return json.dumps( [dict(ix) for ix in rows] ) #CREATE JSON

@app.route('/migration-by-county')
def migration_county():
    #abs(random() % 1000)/100.0 as

    if request.args:
        args = request.args
        sql = r"SELECT county,state,target, value from counties inner join edges_county on target=id where source={clicked_county}" \
            .format(clicked_county=args["clicked_county"])
    print(sql)
    conn = sqlite3.connect( DB )
    conn.row_factory = sqlite3.Row # This enables column access by name: row['column_name']
    db = conn.cursor()
    rows = db.execute(sql).fetchall()
    conn.close()
    return json.dumps( [dict(ix) for ix in rows] ) #CREATE JSON

@app.route('/get-county-info')
def get_countyinfo():
    #abs(random() % 1000)/100.0 as

    if request.args:
        args = request.args
        sql = r"SELECT county,state from counties where id={id}" \
            .format(id=args["id"])

    conn = sqlite3.connect( DB )
    conn.row_factory = sqlite3.Row # This enables column access by name: row['column_name']
    db = conn.cursor()
    rows = db.execute(sql).fetchall()
    conn.close()
    return json.dumps( [dict(ix) for ix in rows] ) #CREATE JSON

if __name__ == '__main__':

    app.run()
