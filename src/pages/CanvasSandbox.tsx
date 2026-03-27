import { StencilCanvas } from "@/components/StencilCanvas";
import { damask } from "@/motifs";

const CanvasSandbox = () => {
  return <StencilCanvas motif={damask} />;
};

export default CanvasSandbox;
