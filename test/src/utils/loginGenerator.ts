import request from "supertest";
import TestAgent from "supertest/lib/agent.js";
import { App } from "supertest/types.js";
import { expect } from "vitest";
import {
  ENDPOINT_CREATE,
  ENDPOINT_DATA,
  ENDPOINT_DESTROY,
  TEST_CLIENT_COUNT,
} from "../config.js";
import shortUUID from "./shortUUID.js";

interface LoginGeneratorOptions {
  count?: number;
  logout?: boolean;
  withData?: boolean;
}

function agentGenerator(app: App, agentCount: number) {
  const agents: TestAgent[] = [];
  for (let index = 0; index < agentCount; index++)
    agents.push(request.agent(app));
  return agents;
}

export default async (
  app: App,
  {
    count = TEST_CLIENT_COUNT,
    logout = false,
    withData = true,
  }: LoginGeneratorOptions = {},
) => {
  const testDatas: string[] = [];
  const agents = agentGenerator(app, count);

  for (const agent of agents) {
    const testData1 = shortUUID();
    const testData2 = shortUUID();

    const testDataResponseWithoutSession = await agent.get(ENDPOINT_DATA);
    expect(testDataResponseWithoutSession.ok).toBe(false);

    const endpoint1 = `${ENDPOINT_CREATE}${withData ? `?data=${testData1}` : ""}`;
    const endpoint2 = `${ENDPOINT_CREATE}${withData ? `?data=${testData2}` : ""}`;

    const loginResponse1 = await agent.get(endpoint1);
    expect(loginResponse1.ok).toBe(true);
    expect(loginResponse1.text).toBe(withData ? testData1 : "");

    const testDataResponse1 = await agent.get(ENDPOINT_DATA);
    expect(testDataResponse1.ok).toBe(withData);
    if (withData) expect(testDataResponse1.text).toBe(testData1);

    const loginResponse2 = await agent.get(endpoint2);
    expect(loginResponse2.ok).toBe(true);
    expect(loginResponse2.text).toBe(withData ? testData2 : "");

    const testDataResponse2 = await agent.get(ENDPOINT_DATA);
    expect(testDataResponse2.ok).toBe(withData);
    if (withData) expect(testDataResponse2.text).toBe(testData2);

    if (logout) {
      const logoutResponse = await agent.get(ENDPOINT_DESTROY);
      expect(logoutResponse.ok).toBe(true);
    } else if (withData) {
      testDatas.push(testData2);
    }
  }

  return testDatas;
};
