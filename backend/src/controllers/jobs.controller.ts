import { Request, Response } from "express";
import { IJob } from "../types/job.types";
import Jobs from "../models/jobs.model";

const jobsController = {
  async getAll(req: Request, res: Response) {
    try {
      const jobs: IJob[] = await Jobs.find();

      if (!jobs) return res.status(404).json({ message: "No jobs found" });

      return res
        .status(200)
        .json({ message: `${jobs.length} Job(s) fetched`, jobs });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to fetch all  job postings",
        error: error.message,
      });
    }
  },
  async getOne(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      const job = await Jobs.findById(jobId);

      if (!job) return res.status(404).json({ message: "No job found" });

      return res.status(200).json({ message: "Jobs Fetched", job });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to fetch all  job postings",
        error: error.message,
      });
    }
  },

  async createJob(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        requirements,
        weights,
        deadline,
        jobType,
        locationType,
        salary,
        benefits,
        status,
        applicationFields,
      }: Partial<IJob> = req.body;

      const newJob = await Jobs.create({
        title,
        description,
        requirements,
        weights,
        deadline,
        jobType,
        locationType,
        salary,
        benefits,
        status,
        applicationFields,
      });

      return res
        .status(201)
        .json({ message: "Job posting created", job: newJob });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to create a new job posting",
        error: error.message,
      });
    }
  },

  async updateJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const payload: Partial<IJob> = req.body;

      const updatedJob = await Jobs.findByIdAndUpdate(jobId, payload, {
        new: true,
        runValidators: true,
      });
      if (!updatedJob) return res.status(404).json({ message: "No job found" });

      return res
        .status(200)
        .json({ message: "Job posting updated", updatedJob });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to update Job", error: error.message });
    }
  },

  async deleteJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      const deleteJob = await Jobs.findByIdAndDelete(jobId);

      if (!deleteJob) return res.status(404).json({ message: "No job found" });

      return res.status(200).json({ message: "Job Deleted", deleteJob });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to delete job post", error: error.message });
    }
  },
};

export { jobsController };
