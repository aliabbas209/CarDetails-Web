const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const csv = require("csvtojson");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/bmw-database", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB error:"));

const DataSchema = new mongoose.Schema({}, { strict: false });
const DataModel = mongoose.model("cardetails", DataSchema);

app.get("/data", async (req, res) => {
  const { search, column, condition } = req.query;
  const query = {};

  if (column) {
    if (condition === "empty") {
      query[column] = { $in: [null, ""] };
    } else if (search !== undefined && search !== null && search !== "") {
      const isNumber = !isNaN(search) && search.trim() !== "";
      if (condition === "equals") {
        if (isNumber) {
          // Match either the number or the string version
          query[column] = { $in: [Number(search), search] };
        } else {
          query[column] = {
            $regex: new RegExp(`^${escapeRegex(search)}$`, "i"),
          };
        }
      } else if (["contains", "starts", "ends"].includes(condition)) {
        let regex = search;
        if (condition === "starts") regex = "^" + escapeRegex(search);
        else if (condition === "ends") regex = escapeRegex(search) + "$";
        else regex = escapeRegex(search);

        if (isNumber) {
          // Match either the number or the string pattern
          query["$or"] = [
            { [column]: Number(search) },
            { [column]: { $regex: regex, $options: "i" } },
          ];
        } else {
          query[column] = { $regex: regex, $options: "i" };
        }
      }
    }
  }
  console.log("MongoDB Query:", JSON.stringify(query, null, 2));

  try {
    const results = await DataModel.find(query).limit(100);
    res.json(results);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Regex escape helper
function escapeRegex(text) {
  return text.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

// API: Get all columns (field names) from cardetails collection
app.get("/columns", async (req, res) => {
  try {
    const doc = await DataModel.findOne();
    if (!doc) {
      return res.json({ columns: [] });
    }
    const columns = Object.keys(doc.toObject());
    res.json({ columns });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch columns" });
  }
});

app.get("/data/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await DataModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

app.delete("/data/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await DataModel.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

app.listen(4000, () => console.log("Backend running on port 4000"));
