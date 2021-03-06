import uuidv4 from 'uuid/v4';
import db from '../models/query';
import Helper from '../helpers/helper';

const Party = {
  async createParty(req, res) {
    if (!req.body.name || !req.body.address || !req.body.logo) {
      return res.status(400).send({ status: 400, 'Error': 'All fields are required'});
    }

    if (!isNaN(req.body.name) || req.body.name.length < 1) {
      return res.status(400).send({ status: 400, 'Error': 'Please enter valid details' });
    }
    const text = `INSERT INTO
      parties(id, name, address, logo)
      VALUES($1, $2, $3, $4)
      returning *`;
    const values = [
      uuidv4(),
      Helper.trimString(req.body.name),
      Helper.trimString(req.body.hqAddress),
      Helper.trimString(req.body.logoUrl),
    ];

    try {
      const { rows } = await db.query(text, values);
      return res.status(201).send({
        status: 201,
        data: [rows[0]]
      });
    } catch(error) {
      return res.status(400).send({status: 400, error:"Bad Request, Cannot create Party"});
    }
  },
 async getAllParty(req, res) {
    const findAllQuery = 'SELECT * FROM parties';
    try {
      const { rows, rowCount } = await db.query(findAllQuery);
      return res.status(200).send({ 
        status: 201,
        data: rows 
      });
    } catch(error) {
      return res.status(400).send({status: 400, error:"Bad Request, cannot get parties"});
    }
  },
  async getOneParty(req, res) {
    const text = 'SELECT * FROM parties WHERE id = $1';
    try {
      const { rows } = await db.query(text, [req.params.id]);
      if (!rows[0]) {
        return res.status(404).send({status: 404, 'error': 'Party not found'});
      }
      return res.status(200).send({
        status: 200,
        data: [rows[0]]
      });
    } catch(error) {
      return res.status(400).send({status: 400, "error": error})
    }
  },
  async updateParty(req, res) {
    const findOneQuery = 'SELECT * FROM parties WHERE id=$1';
    const updateOneQuery =`UPDATE parties
      SET name=$1,address=$2,logo=$3 returning *`;
    try {
      const { rows } = await db.query(findOneQuery, [req.params.id]);
      if(!rows[0]) {
        return res.status(404).send({status: 404, 'message': 'Party not found'});
      }
      const values = [
        req.body.name || rows[0].name,
        req.body.address || rows[0].address,
        req.body.logo || rows[0].logo,
        req.params.id
      ];
      const response = await db.query(updateOneQuery, values);
      return res.status(200).send(response.rows[0]);
    } catch(err) {
      return res.status(400).send(err);
    }
  },
    async deleteParty(req, res) {
    const deleteQuery = 'DELETE FROM parties WHERE id=$1 returning *';
    try {
      const { rows } = await db.query(deleteQuery, [req.params.id]);
      if(!rows[0]) {
        return res.status(404).send({status: 404, 'error': 'Party not found'});
      }
      return res.status(204).send({
        status: 204,
        "message": "Deleted"
      });
    } catch(error) {
      return res.status(400).send(error);
    }
  }
}

export default Party;
