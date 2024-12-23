import { Document, Page } from "react-pdf";

type Props = {
  file: string;
  pageNumber?: number;
};

const PdfPreview = ({ file }: Props) => {
  return (
    <Document file={file}>
      <Page pageNumber={1} />
    </Document>
  );
};

export default PdfPreview;
