import React from 'react';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Interpretation and Definitions */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Interpretation and Definitions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interpretation</h3>
                <p className="text-gray-700 leading-relaxed">
                  The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Definition</h3>
                <p className="text-gray-700 leading-relaxed mb-4">For the purposes of these Terms and Conditions:</p>
                <ul className="custom-bullet-list text-gray-700">
                  <li>Affiliate means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
                  <li>Country refers to: North Carolina, United States</li>
                  <li>Company (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Wondrous Games Inc., A Delaware C-corporation operating in Fuquay Varina NC 27526.</li>
                  <li>Device means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                  <li>Service refers to the Website.</li>
                  <li>Terms and Conditions (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.</li>
                  <li>Third-party Social Media Service means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.</li>
                  <li>Website refers to Wondrous Digital, accessible from https://wondrousdigital.com</li>
                  <li>You means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Acknowledgment
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.
              </p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Intellectual Property
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content (excluding Content provided by You or other users), features and functionality are and will remain the exclusive property of the Company and its licensors.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of the Company.
              </p>
            </div>
          </div>

          {/* Links to Other Websites */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Links to Other Websites
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Termination
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, Your right to use the Service will cease immediately.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Limitation of Liability
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of this Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.
              </p>
            </div>
          </div>

          {/* "AS IS" Disclaimer */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              "AS IS" and "AS AVAILABLE" Disclaimer
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.
            </p>
          </div>

          {/* Disputes Resolution */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Disputes Resolution
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.
            </p>
          </div>

          {/* For European Union Users */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              For European Union (EU) Users
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.
            </p>
          </div>

          {/* United States Legal Compliance */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              United States Legal Compliance
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a "terrorist supporting" country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.
            </p>
          </div>

          {/* Severability and Waiver */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Severability and Waiver
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Severability</h3>
                <p className="text-gray-700 leading-relaxed">
                  If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Waiver</h3>
                <p className="text-gray-700 leading-relaxed">
                  Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.
                </p>
              </div>
            </div>
          </div>

          {/* Translation Interpretation */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Translation Interpretation
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Changes to These Terms and Conditions
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Cookies Policy, You can contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> hello@wondrousdigital.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;