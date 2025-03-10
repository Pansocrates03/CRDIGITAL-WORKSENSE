import {sqlConnect, sql} from "../utils/sql.js"

export const getText = async (req, res) => {
    const pool = await sqlConnect();
    const data = await pool.request().query('select * from test');
    res.json(data.recordset);
};