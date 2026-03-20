import { usePipeline } from '../contexts/PipelineContext';

export const usePipelineActions = () => {
  const ctx = usePipeline();
  return ctx;
};
