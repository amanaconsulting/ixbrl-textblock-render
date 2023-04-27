import $ from 'jquery'
import { iXBRLViewer } from "ixbrl-viewer";
import { PdfPreviewPlugin } from "./preview-plugin";

$(function () {
    var iv = new iXBRLViewer({ continuationElementLimit: -1,  showValidationWarningOnStart: false });
    var ivp = new PdfPreviewPlugin(iv);
    iv.registerPlugin(ivp);
    iv.load();
});