namespace GEPF.Services
{
    public class InputValues
    {
        public DateTime? DOB { get; set; } = new DateTime(1982, 3, 3);
        public string GenderSelection { get; set; }=default!;
        public string FundSelection { get; set; } = "GEPF";
        public string AnnuitySelection { get; set; } = "Guaranteed Annuity";

        public double AnnualSalary { get; set; } = 1000000;
        public double RetirementSavings { get; set; } = 700000;
        public double CPISelection { get; set; } = 0.05;
        public double FundGrowth { get; set; }
        //public double DrawDownSelection { get; set; } = 0.06;
        public double DrawDownSelection { get; set; } = 0;
        public double ContributionSelection { get; set; } = 0.1;
        public double NRR { get; set; } = 0.8;

        public int RetAge { get; set; } = 65;

        /// <summary>
        /// Whether the form above these figures has actually been filled in and
        /// sent. Opening the results on their own — a bookmark, or a refresh
        /// after the browser has been closed — starts a fresh set of answers
        /// nobody gave, and figures worked out from those belong to nobody.
        /// </summary>
        public bool Answered { get; set; }
    }
}
