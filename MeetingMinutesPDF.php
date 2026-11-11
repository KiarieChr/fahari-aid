<?php
require_once('tcpdf/tcpdf.php');

class MeetingMinutesPDF extends TCPDF {
    private $meetingData;
    private $minutesData;
    private $logoPath;
    
    public function __construct($meetingData, $minutesData, $logoPath = null) {
        parent::__construct(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $this->meetingData = $meetingData;
        $this->minutesData = $minutesData;
        $this->logoPath = $logoPath;
        
        // Set document information
        $this->SetCreator(PDF_CREATOR);
        $this->SetAuthor('Jesus Enthroned Network');
        $this->SetTitle('Meeting Minutes: ' . $meetingData['name']);
        $this->SetSubject('Official Meeting Minutes');
        
        // Set default monospaced font
        $this->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
        
        // Set margins
        $this->SetMargins(15, 30, 15);
        $this->SetHeaderMargin(10);
        $this->SetFooterMargin(15);
        
        // Set auto page breaks
        $this->SetAutoPageBreak(TRUE, 25);
        
        // Set colors
        $this->primaryColor = array(58, 95, 142);  // Navy blue
        $this->secondaryColor = array(200, 212, 227); // Light blue
    }
    
    public function Header() {
        // Logo
        $logoWidth = 30;
        if ($this->logoPath && file_exists($this->logoPath)) {
            $this->Image($this->logoPath, 15, 10, $logoWidth, 0, '', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }
        
        // Meeting title
        $this->SetFont('helvetica', 'B', 16);
        $this->SetTextColorArray($this->primaryColor);
        $this->SetXY(50, 10);
        $this->Cell(0, 10, $this->meetingData['name'], 0, 1);
        
        // Meeting date
        $this->SetFont('helvetica', '', 12);
        $this->SetXY(50, 20);
        $dateString = date('F j, Y', strtotime($this->meetingData['start_time']));
        $timeString = date('g:i a', strtotime($this->meetingData['start_time'])) . ' - ' . 
                      date('g:i a', strtotime($this->meetingData['end_time']));
        $this->Cell(0, 6, $dateString . ' | ' . $timeString, 0, 1);
        
        // Reset colors
        $this->SetTextColor(0, 0, 0);
    }
    
    public function Footer() {
        // Position at 15mm from bottom
        $this->SetY(-15);
        
        // Set font
        $this->SetFont('helvetica', 'I', 8);
        $this->SetTextColorArray($this->primaryColor);
        
        // Church slogan (left-aligned)
        $slogan = "Kingdom | Unity | Purpose";
        $this->Cell(0, 6, $slogan, 0, 0, 'L');
        
        // Page number (right-aligned)
        $pageNumber = 'Page | ' . $this->getAliasNumPage();
        $this->Cell(0, 6, $pageNumber, 0, 0, 'R');
    }
    
    public function generatePDF() {
        $this->AddPage();
        
        // Meeting details section
        $this->SetFont('helvetica', 'B', 12);
        $this->Cell(0, 8, 'Meeting Details', 0, 1);
        $this->SetFont('helvetica', '', 11);
        
        // Add border around details
        $this->SetLineStyle(array('width' => 0.3, 'color' => $this->secondaryColor));
        $this->SetFillColorArray($this->secondaryColor);
        $this->Cell(0, 1, '', 'LTR', 1, 'L', true);
        
        // Facilitator information would go here (you'll need to join with users table)
        $this->Cell(40, 8, 'Meeting Type:', 0, 0);
        $this->Cell(0, 8, $this->getMeetingTypeName($this->meetingData['meeting_type']), 0, 1);
        
        if (!empty($this->meetingData['meeting_link'])) {
            $this->Cell(40, 8, 'Meeting Link:', 0, 0);
            $this->Cell(0, 8, $this->meetingData['meeting_link'], 0, 1);
        }
        
        $this->Cell(0, 1, '', 'LBR', 1, 'L', true);
        $this->Ln(10);
        
        // Minutes content
        $this->SetFont('helvetica', 'B', 12);
        $this->Cell(0, 8, 'Meeting Minutes', 0, 1);
        $this->SetFont('helvetica', '', 11);
        
        // Process minutes HTML content
        $minutesContent = $this->minutesData['minutes'];
        $this->writeHTML($this->formatMinutesContent($minutesContent), true, false, true, false, '');
        
        $this->Output('meeting_minutes_' . $this->meetingData['id'] . '.pdf', 'I');
    }
    
    private function formatMinutesContent($content) {
        // Basic HTML formatting for minutes
        return '<style>
            body { font-family: helvetica; font-size: 11pt; line-height: 1.5; }
            h3 { color: #3a5f8e; font-size: 12pt; font-weight: bold; margin-top: 10px; }
            .action-item { background-color: #f8f9fa; padding: 5px; border-left: 3px solid #dc3545; }
            .decision { font-weight: bold; color: #28a745; }
        </style>
        <div>' . $content . '</div>';
    }
    
    private function getMeetingTypeName($typeId) {
        // You would query your meeting_types table here
        $types = [
            1 => 'Board Meeting',
            2 => 'Committee Meeting',
            3 => 'General Assembly',
            // Add all your meeting types
        ];
        return $types[$typeId] ?? 'Meeting';
    }
}
?>