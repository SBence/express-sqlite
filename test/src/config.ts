import { tmpdir } from "os";
import { join } from "path";
import shortUUID from "./utils/shortUUID.js";

export const TEST_CLIENT_COUNT = 5;
export const TEST_ARTIFACTS_FOLDER = join(tmpdir(), shortUUID());

export const ENDPOINT_CREATE = "/login";
export const ENDPOINT_DESTROY = "/logout";
export const ENDPOINT_DATA = "/test";
