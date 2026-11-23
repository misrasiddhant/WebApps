# DDL Generator

![HTML](https://img.shields.io/badge/HTML-5-e34f26?style=flat-square&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-f7df1e?style=flat-square&logo=javascript&logoColor=black)

DDL Generator is a browser-only tool for deriving a Hive table schema from a header and one sample row. It infers common data types, lets you edit the inferred columns, and exposes table, storage, row-format, ORC, and SerDe properties.

## Setup and run

No installation or build step is required. Open [`index.html`](./index.html) directly in a browser, or serve this directory with a static file server:

```bash
cd DDLGenerator
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## How to use

1. Enter a delimited header and a single sample data row.
2. Confirm or change the detected separator.
3. Select the schema and table properties.
4. Review the inferred schema and adjust column types or comments as needed.
