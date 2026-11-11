<?php
require_once('tcpdf/tcpdf.php');

class ChurchCommunicationsPDF extends TCPDF {
    private $communications;
    private $headerHeight = 25;
    private $logoPath;
    
    public function __construct($communications, $logoPath = null) {
        parent::__construct(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $this->communications = $communications;
        $this->logoPath = $logoPath;
        
        // Set document information
        $this->SetCreator(PDF_CREATOR);
        $this->SetAuthor('Your Church Name');
        $this->SetTitle('Church Communications Archive');
        $this->SetSubject('All Church Communications');
        
        // Set default monospaced font
        $this->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
        
        // Set margins (left, top, right)
        $this->SetMargins(15, 30, 15);
        $this->SetHeaderMargin(10);
        $this->SetFooterMargin(15);
        
        // Set auto page breaks
        $this->SetAutoPageBreak(TRUE, 25);
        
        // Set colors
        $this->primaryColor = array(58, 95, 142);  // Navy blue
        $this->secondaryColor = array(200, 212, 227); // Light blue
        $this->accentColor = array(220, 53, 69); // Red
    }
    
    public function Header() {
        // Logo positioning
        $logoWidth = 20; // Width of your logo in mm
        $logoX = 15; // Left margin
        
        // Add logo if exists
        if ($this->logoPath && file_exists($this->logoPath)) {
            $this->Image($this->logoPath, $logoX, 10, $logoWidth, 0, '', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }
        
        // Calculate remaining space for title
        $titleX = $logoX + $logoWidth + 5;
        $titleWidth = $this->getPageWidth() - $titleX - 15; // Right margin
        
        // Title with background color
        $this->SetFont('helvetica', 'B', 16);
        $this->SetFillColorArray($this->primaryColor);
        $this->SetTextColor(255, 255, 255); // White text
        $this->SetXY($titleX, 10);
        $this->Cell($titleWidth, 10, 'JEN Communications Archive', 0, 1, 'C', 1);
        
        // Generation date
        $this->SetFont('helvetica', 'I', 10);
        $this->SetTextColorArray($this->primaryColor);
        $this->SetXY($titleX, 20);
        $this->Cell($titleWidth, 6, 'Generated on: ' . date('F j, Y, g:i a'), 0, 1, 'R');
        
        // Reset colors
        $this->SetTextColor(0, 0, 0);
        $this->SetFillColor(255, 255, 255);
        
        // Add spacing after header
        $this->Ln(5);
    }
    public function Footer() {
    // Position at 15mm from bottom
    $this->SetY(-15);
    
    // Set font for slogan
    $this->SetFont('helvetica', 'I', 8);
    $this->SetTextColorArray($this->primaryColor);
    
    // Church slogan (left-aligned)
    $slogan = "Kingdom | Unity | Purpose";
    $this->Cell(0, 6, $slogan, 0, 0, 'L');
    
    // Custom page number format (right-aligned)
    $pageNumber = 'Page | ' . $this->getAliasNumPage() . ' of ' . $this->getAliasNbPages();
    $this->Cell(0, 6, $pageNumber, 0, 0, 'R');
    
    // Optional: Add a small separator line above footer
    $this->SetY(-18);
    $this->SetLineStyle(array('width' => 0.2, 'color' => $this->secondaryColor));
    $this->Line(15, $this->GetY(), $this->getPageWidth()-15, $this->GetY());
}
    public function generatePDF() {
        // Add a page
        $this->AddPage();
        
        // Set default font
        $this->SetFont('helvetica', '', 12);
        
        foreach ($this->communications as $comm) {
            $this->addCommunication($comm);
        }
        
        // Close and output PDF document
        $this->Output('church_communications_'.date('Ymd_His').'.pdf', 'I');
    }
    
    protected function addCommunication($comm) {
        // Communication date
        $this->Ln(10);
        $this->SetFont('helvetica', 'B', 12);
        $this->SetFillColor(230, 230, 230);
        $this->Cell(0, 8, date('F j, Y', strtotime($comm['created_at'])), 0, 1, 'L', true);
        $this->Ln(2);
        
        // Communication content (with basic HTML support)
        $this->SetFont('helvetica', '', 11);
        $this->writeHTML($comm['communication'], true, false, true, false, '');
        
        // Add separator
        $this->Ln(5);
        $this->SetLineStyle(array('width' => 0.2, 'color' => array(200, 200, 200)));
        $this->Line(15, $this->GetY(), $this->getPageWidth()-15, $this->GetY());
        $this->Ln(10);
    }
}
?>