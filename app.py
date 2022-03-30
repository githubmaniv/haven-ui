from flask import Flask
from flask import jsonify
app = Flask(__name__)

@app.route('/')
def hello_world():
    return jsonify({'name':'Haven',
                    'greeting':'Hello World!'})

@app.route('/zipcode-rating')
def zipcode_rating():
    return jsonify([{'id':'01001',
                    'state':'Alabama',
                    'county':'Autauga County',
                    'rate':5.1}])

if __name__ == '__main__':
    app.run()
