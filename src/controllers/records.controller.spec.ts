import "reflect-metadata";
import { RecordsController } from "./records.controller";
import { Arg, Substitute } from "@fluffy-spoon/substitute";
import { ILogger } from "../pkg/logger/logger-api";
import { IRecordsService } from "../services/records/records.service.api";
import { Request, Response } from "express";
import { CookerOptionsInvalidError } from "../pkg/cooker/cook";

describe("Records Controller", () => {
  describe("Get", () => {
    it("Invalid record arg", async () => {
      const ctrl = getMockService();
      const reqP = prepareRequest({ id: "dhdhd" });
      await ctrl.get(reqP.req, reqP.res);
      expect(reqP.returnObj.rCode).toEqual(404);
    });
    it("Valid record arg", async () => {
      const ctrl = getMockService();
      const reqP = prepareRequest({ id: "1" });
      await ctrl.get(reqP.req, reqP.res);
      expect(reqP.returnObj.rCode).toEqual(200);
    });
    it("Format error", async () => {
      const ctrl = getMockService({
        metadataError: new CookerOptionsInvalidError(),
      });
      const reqP = prepareRequest({ id: "1" });
      await ctrl.get(reqP.req, reqP.res);
      expect(reqP.returnObj.rCode).toEqual(422);
    });
    it("Unexpected error", async () => {
      const ctrl = getMockService({
        metadataError: new Error(),
      });
      const reqP = prepareRequest({ id: "1" });
      await ctrl.get(reqP.req, reqP.res);
      expect(reqP.returnObj.rCode).toEqual(500);
    });
  });
  describe("Delete", () => {
    it("Invalid record arg", async () => {
      const ctrl = getMockService();
      const reqP = prepareRequest({ id: "dhdhd" });
      await ctrl.delete(reqP.req, reqP.res);
      expect(reqP.returnObj.rCode).toEqual(404);
    });
    it("Valid record arg", async () => {
      const ctrl = getMockService();
      const reqP = prepareRequest({ id: "1" });
      await ctrl.delete(reqP.req, reqP.res);
      expect(reqP.returnObj.rCode).toEqual(200);
    });
    it("Could not delete", async () => {
      const ctrl = getMockService({
        deleteReturn: false,
      });
      const reqP = prepareRequest({ id: "1" });
      await ctrl.delete(reqP.req, reqP.res);
      expect(reqP.returnObj.rCode).toEqual(403);
    });
    it("Valid record arg", async () => {
      const ctrl = getMockService({
        deleteReturn: new Error(),
      });
      const reqP = prepareRequest({ id: "1" });
      await ctrl.delete(reqP.req, reqP.res);
      expect(reqP.returnObj.rCode).toEqual(500);
    });
  });
});

function prepareRequest(params: Record<string, unknown>) {
  const req = Substitute.for<Request>();
  req.params.returns(params);
  const res = Substitute.for<Response>();
  // Object are passed by ref in JS, but plain types are passes as values
  // Wrapping the object this way will allow for changes to rCode to be reflected
  const ret = {
    rCode: 200,
  };
  res.status.returns((code) => {
    ret.rCode = code;
  });
  return { req: req, res: res, returnObj: ret };
}

function getMockService(
  err?: Partial<{
    metadataError: Error;
    deleteReturn: Error | boolean;
  }>
) {
  const rService = Substitute.for<IRecordsService>();
  if (err?.metadataError)
    rService.getMetadata(Arg.all()).throws(err?.metadataError);

  if (err?.deleteReturn !== undefined) {
    if (err?.deleteReturn instanceof Error)
      rService.delete(Arg.all()).throws(err?.deleteReturn);
    else rService.delete(Arg.all()).returns(Promise.resolve(err?.deleteReturn));
  }

  return new RecordsController(rService, Substitute.for<ILogger>());
}