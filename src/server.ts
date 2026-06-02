import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { Pool } from "pg";

const app: Application = express();
const port = 5000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_u8QUaIA0hPnY@ep-tiny-truth-aquobfgt.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY, 
      name VARCHAR(20),
      email VARCHAR(30) UNIQUE NOT NULL,
      password VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      age INT,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    //ekhane ekta letter o jodi vul hoy taholeo code run korbe na sathe Database a data jabe na
    console.log("Datase Connected Successfully");
  } catch (error) {
    console.log(error);
  }
};
initDB();

app.get("/", (req: Request, res: Response) => {
  // res.send("Hello World!");
  res.status(200).json({
    message: "Express server",
    author: "Next Level",
  });
});
app.post("/api/users", async (req: Request, res: Response) => {
  const { name, email, password, age } = req.body;

  try {
    const result = await pool.query(
      `
    INSERT INTO users(name, email, password, age)
    VALUES($1,$2,$3,$4)
    RETURNING *
  `,
      [name, email, password, age],
    );
    console.log(result);
    res.status(201).json({
      success: true,
      massage: " User Created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      massage: error.message,
      error: error,
    });
  }
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM users
    `);
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      massage: error.message,
      error: error,
    });
  }
});
app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(id);
  try {
    const result = await pool.query(
      `
      SELECT * FROM users WHERE id=$1
      `,
      [id],
    );
    // console.log(result);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found!",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      massage: error.message,
      error: error,
    });
  }
});

app.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password, age, is_active } = req.body;

  //   console.log(id);
  // console.log({name, password, age, is_active});
 try {
   const result = await pool.query(
     `
  UPDATE users SET name=$1,password=$2,age=$3,is_active=$4
  WHERE id=$5 RETURNING *
  `,
     [name, password, age, is_active, id],
   );
   // console.log(result);
   if (result.rows.length === 0) {
     res.status(404).json({
       success: false,
       message: "User not found!"
     });
   }
   res.status(200).json({
     success: true,
     message: "User updated successfully",
     data: result.rows[0],
   });
 } catch (error :any) {
    res.status(500).json({
      success: false,
      massage: error.message,
      error: error,
    });
 }
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
