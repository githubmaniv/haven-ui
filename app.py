from flask import Flask
from flask import jsonify
import sqlite3
import json
app = Flask(__name__)
DB = "./data/home.db"
@app.route('/')
def hello_world():
    return jsonify({'name':'Haven',
                    'greeting':'Hello World!'})

@app.route('/county-rating')
def county_rating():
    conn = sqlite3.connect( DB )
    conn.row_factory = sqlite3.Row # This enables column access by name: row['column_name']
    db = conn.cursor()
    rows = db.execute('''
    SELECT id,county,state,rate from counties
    ''').fetchall()
    conn.close()
    return json.dumps( [dict(ix) for ix in rows] ) #CREATE JSON




if __name__ == '__main__':

    app.run()
