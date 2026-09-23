import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./generated/types";

export const fetchClient = createFetchClient<paths>({
  baseUrl: "http://localhost:8400",
  credentials: "include",
});

export const $api = createClient(fetchClient);
