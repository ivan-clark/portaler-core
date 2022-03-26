"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const db_1 = require("./db");
const logger_1 = __importDefault(require("./logger"));
const accessToken = process.env.ACCESS_TOKEN;
const fileUrl = process.env.WORLD_FILE_URL;
let oldHash = '';
const gqlQuery = `
  query {
    repository(owner: "broderickhyman", name: "ao-bin-dumps") {
      ref(qualifiedName: "refs/heads/master") {
        target {
          ... on Commit {
            history(first: 1, path: "cluster/world.json") {
              edges {
                node {
                  oid
                }
              }
            }
          }
        }
      }
    }
  }
`;
const getNewFile = async () => {
    try {
        if (oldHash === '') {
            oldHash = await db_1.db.Logs.getLatestCommit();
        }
        const githubResponse = await node_fetch_1.default('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ query: `${gqlQuery}` }),
        });
        if (!githubResponse.ok) {
            throw new Error('Github API Failure');
        }
        const json = await githubResponse.json();
        const hash = json.data.repository.ref.target.history.edges[0].node.oid;
        if (hash === oldHash) {
            return null;
        }
        await db_1.db.Logs.updateLatestCommit(hash);
        const fileJson = await node_fetch_1.default(fileUrl, { method: 'GET' }).then((res) => {
            if (!res.ok) {
                throw new Error('Get File Error');
            }
            return res.json();
        });
        const fileData = fileJson.world.clusters.cluster;
        const fileString = JSON.stringify(fileData).replace(/@/gi, '');
        return JSON.parse(fileString);
    }
    catch (err) {
        logger_1.default.error(err);
        return null;
    }
};
exports.default = getNewFile;
