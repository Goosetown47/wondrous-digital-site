import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-display mb-6" style={{ color: 'rgb(31, 10, 66)' }}>
            Wondrous Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You. We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </div>

          {/* Interpretation and Definitions */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Information We Collect
            </h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interpretation</h3>
              <p className="text-gray-700 leading-relaxed">
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Definition</h3>
              <p className="text-gray-700 leading-relaxed">For the purposes of this Privacy Policy:</p>
              <ul className="custom-bullet-list mt-4 text-gray-700">
                <li>Account means a unique account created for You to access our Service or parts of our Service.</li>
                <li>Affiliate means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
                <li>Business , for the purpose of CCPA/CPRA, refers to the Company as the legal entity that collects Consumers' personal information and determines the purposes and means of the processing of Consumers' personal information, or on behalf of which such information is collected and that alone, or jointly with others, determines the purposes and means of the processing of consumers' personal information, that does business in the State of California.</li>
                <li>CCPA and/or CPRA refers to the California Consumer Privacy Act (the "CCPA") as amended by the California Privacy Rights Act of 2020 (the "CPRA").</li>
                <li>Company (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Wondrous Games Inc, Fuquay- Varina, NC 27526.</li>
                <li>For the purpose of the GDPR, the Company is the Data Controller.</li>
                <li>Consumer , for the purpose of the CCPA/CPRA, means a natural person who is a California resident. A resident, as defined in the law, includes (1) every individual who is in the USA for other than a temporary or transitory purpose, and (2) every individual who is domiciled in the USA who is outside the USA for a temporary or transitory purpose.</li>
                <li>Cookies are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</li>
                <li>Country refers to: United States</li>
                <li>Data Controller , for the purposes of the GDPR (General Data Protection Regulation), refers to the Company as the legal person which alone or jointly with others determines the purposes and means of the processing of Personal Data.</li>
                <li>Device means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                <li>Do Not Track (DNT) is a concept that has been promoted by US regulatory authorities, in particular the U.S. Federal Trade Commission (FTC), for the Internet industry to develop and implement a mechanism for allowing internet users to control the tracking of their online activities across websites.</li>
                <li>GDPR refers to EU General Data Protection Regulation.</li>
                <li>Personal Data is any information that relates to an identified or identifiable individual.</li>
                <li>For the purposes of GDPR, Personal Data means any information relating to You such as a name, an identification number, location data, online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity.</li>
                <li>For the purposes of the CCPA/CPRA, Personal Data means any information that identifies, relates to, describes or is capable of being associated with, or could reasonably be linked, directly or indirectly, with You.</li>
                <li>Service refers to the Website.</li>
                <li>Service Provider means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used. For the purpose of the GDPR, Service Providers are considered Data Processors.</li>
                <li>Usage Data refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
                <li>Website refers to Wondrous Digital, accessible from <a href="https://wondrousdigital.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#F666AB' }} onMouseEnter={(e) => e.target.style.color = '#3E33C0'} onMouseLeave={(e) => e.target.style.color = '#F666AB'}>wondrousdigital.com</a> - which is the digital agency branch of Wondrous Games, Inc. a Delaware C-Corporation.</li>
                <li>You means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
                <li>Under GDPR, You can be referred to as the Data Subject or as the User as you are the individual using the Service.</li>
              </ul>
            </div>
          </div>

          {/* Types of Data Collected */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Types of Data Collected
            </h2>
            <h3 className="font-semibold text-gray-900 mb-2">Personal Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Address, State, Province, ZIP/Postal code, City</li>
              <li>Usage Data</li>
            </ul>
            <br />
            <h3 className="font-semibold text-gray-900 mb-2">Usage Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
            Usage Data is collected automatically when using the Service.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.
            </p>
            
          </div>
          
          {/* Tracking Technologies and Cookies */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Tracking Technologies and Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies we use may include:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>Cookies or Browser Cookies. A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may use Cookies.</li>
              <li>Web Beacons. Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>
            </ul>
            <br />
            <p className="text-gray-700 leading-relaxed mb-4">
            Cookies can be "Persistent\" or "Session\" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser. Learn more about cookies on the <a href="https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/#Use_Of_Cookies_And_Tracking" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#F666AB' }} onMouseEnter={(e) => e.target.style.color = '#3E33C0'} onMouseLeave={(e) => e.target.style.color = '#F666AB'}>Free Privacy Policy website</a> article.
            </p>
          </div>

          {/* Use of Your Personal Data */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Use of Your Personal Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">The Company may use Personal Data for the following purposes:</p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>To provide and maintain our service, including to monitor the usage of our service.</li>
              <li>To manage Your Account: to manage Your registration as a user of the service. The personal data you provide can give You access to different functionalities of the service that are available to You as a registered user.</li>
              <li>For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with us through the service.</li>
              <li>To contact You: To contact you by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</li>
              <li>To provide you with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.</li>
              <li>To manage Your requests: To attend and manage your requests to Us.</li>
              <li>For business transfers: We may use your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which personal data held by us about our service users is among the assets transferred.</li>
              <li>For other purposes: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</li>              
            </ul>
            <br />
            <p className="text-gray-700 leading-relaxed mb-4">We may share your personal information in the following situations:</p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>With service providers: We may share Your personal information with Service Providers to monitor and analyze the use of our Service, to contact You.</li>
              <li>For business transfers: We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
              <li>With Affiliates: We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include our parent company and any other subsidiaries, joint venture partners or other companies that we control or that are under common control with us.</li>
              <li>With business partners: We may share your information with our business partners to offer You certain products, services or promotions.</li>
              <li>With other users: when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.</li>
              <li>With your consent: We may disclose your personal information for any other purpose with Your consent.</li>           
            </ul>
          </div>

          {/* Retention of Your Personal Data */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Retention of Your Personal Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
            <p className="text-gray-700 leading-relaxed mb-4">The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.</p>
          </div>

          {/* Delete Your Personal Data */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Delete Your Personal Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You. Our Service may give You the ability to delete certain information about You from within the Service.</p>
            <p className="text-gray-700 leading-relaxed mb-4">You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.</p>
          </div>

          {/* Transfer Your Personal Data */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Transfer Your Personal Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
            <p className="text-gray-700 leading-relaxed mb-4">The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.</p>
          </div>

          {/* Disclosure of Your Personal Data: Business Transactions */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Disclosure of Your Personal Data: Business Transactions
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
          </div>

          {/* Disclosure of Your Personal Data: Law Enforcement */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Disclosure of Your Personal Data: Law Enforcement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
          </div>

          {/* Disclosure of Your Personal Data: Other Legal Requirements */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Disclosure of Your Personal Data: Other Legal Requirements
            </h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">We may share your personal information in the following situations:</p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>Comply with a legal obligation.</li>
              <li>Protect and defend the rights or property of the Company.</li>
              <li>Prevent or investigate possible wrongdoing in connection with the Service.</li>
              <li>Protect the personal safety of Users of the Service or the public.</li>
              <li>Protect against legal liability.</li>       
            </ul>
          </div>

          {/* Detailed Information on the Processing of Your Personal Data */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Detailed Information on the Processing of Your Personal Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">The Service Providers We use may have access to Your Personal Data. These third-party vendors collect, store, use, process and transfer information about Your activity on Our Service in accordance with their Privacy Policies.</p>
          </div>

          {/* Analytics */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Analytics
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">We may use third-party Service providers to monitor and analyze the use of our Service.</p>
          </div>

          {/* Email Marketing */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Email Marketing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">We may use Your Personal Data to contact You with newsletters, marketing or promotional materials and other information that may be of interest to You. You may opt-out of receiving any, or all, of these communications from Us by following the unsubscribe link or instructions provided in any email We send or by contacting Us.</p>
            <p className="text-gray-700 leading-relaxed mb-4">We may use Email Marketing Service Providers to manage and send emails to you‍.</p>
          </div>

          {/* GDPR Privacy: Legal Basis for Processing Personal Data under GDPR */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              GDPR Privacy: Legal Basis for Processing Personal Data under GDPR
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may process Personal Data under the following conditions:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
                Consent: You have given Your consent for processing Personal Data for one or more specific purposes.
              </li>
              <li>
                Performance of a contract: Provision of Personal Data is necessary for the performance of an agreement with You and/or for any pre-contractual obligations thereof.
              </li>
              <li>
              Legal obligations: Processing Personal Data is necessary for compliance with a legal obligation to which the Company is subject.
              </li>
              <li>
              Vital interests: Processing Personal Data is necessary in order to protect Your vital interests or of another natural person.
              </li>
              <li>
              Public interests: Processing Personal Data is related to a task that is carried out in the public interest or in the exercise of official authority vested in the Company.
              </li>
              <li>
              Legitimate interests: Processing Personal Data is necessary for the purposes of the legitimate interests pursued by the Company.
              </li>
            </ul>
            <br />
            <p className="text-gray-700 leading-relaxed mb-4">
              In any case, the Company will gladly help to clarify the specific legal basis that applies to the processing, and in particular whether the provision of Personal Data is a statutory or contractual requirement, or a requirement necessary to enter into a contract.
            </p>
          </div>

          {/* GDPR Privacy: Your Rights under the GDPR */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              GDPR Privacy: Your Rights under the GDPR
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Company undertakes to respect the confidentiality of Your Personal Data and to guarantee You can exercise Your rights. You have the right under this Privacy Policy, and by law if You are within the EU, to:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
                Request access to Your Personal Data. The right to access, update or delete the information We have on You. Whenever made possible, you can access, update or request deletion of Your Personal Data directly within Your account settings section. If you are unable to perform these actions yourself, please contact Us to assist You. This also enables You to receive a copy of the Personal Data We hold about You.
              </li>
              <li>
                Request correction of the Personal Data that We hold about You. You have the right to have any incomplete or inaccurate information We hold about You corrected.
              </li>
              <li>
              Object to processing of Your Personal Data. This right exists where We are relying on a legitimate interest as the legal basis for Our processing and there is something about Your particular situation, which makes You want to object to our processing of Your Personal Data on this ground. You also have the right to object where We are processing Your Personal Data for direct marketing purposes.
              </li>
              <li>
              Request erasure of Your Personal Data. You have the right to ask Us to delete or remove Personal Data when there is no good reason for Us to continue processing it.
              </li>
              <li>
              Request the transfer of Your Personal Data. We will provide to You, or to a third-party You have chosen, Your Personal Data in a structured, commonly used, machine-readable format. Please note that this right only applies to automated information which You initially provided consent for Us to use or where We used the information to perform a contract with You.
              </li>
              <li>
              Withdraw Your consent. You have the right to withdraw Your consent on using your Personal Data. If You withdraw Your consent, We may not be able to provide You with access to certain specific functionalities of the Service.
              </li>
            </ul>
          </div>

          {/* GDPR Privacy: Exercising of Your GDPR Data Protection Rights */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              GDPR Privacy: Exercising of Your GDPR Data Protection Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may exercise Your rights of access, rectification, cancellation and opposition by contacting Us. Please note that we may ask You to verify Your identity before responding to such requests. If You make a request, We will try our best to respond to You as soon as possible.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
             You have the right to complain to a Data Protection Authority about Our collection and use of Your Personal Data. For more information, if You are in the European Economic Area (EEA), please contact Your local data protection authority in the EEA.
            </p>
          </div>

          {/* GDPR Privacy: Facebook Insights */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
             GDPR Privacy: Facebook Insights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We use the Facebook Insights function in connection with the operation of the Facebook Fan Page and on the basis of the GDPR, in order to obtain anonymized statistical data about Our users. For this purpose, Facebook places a Cookie on the device of the user visiting Our Facebook Fan Page. Each Cookie contains a unique identifier code and remains active for a period of two years, except when it is deleted before the end of this period. Facebook receives, records and processes the information stored in the Cookie, especially when the user visits the Facebook services, services that are provided by other members of the Facebook Fan Page and services by other companies that use Facebook services.
            </p>
          </div>

          {/* CCPA/CPRA Privacy Notice */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              CCPA/CPRA Privacy Notice
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            This privacy notice section for California residents supplements the information contained in Our Privacy Policy and it applies solely to all visitors, users, and others who reside in the State of California.
            </p>
          </div>

          {/* Categories of Personal Information Collected */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Categories of Personal Information Collected
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular Consumer or Device. The following is a list of categories of personal information which we may collect or may have been collected from California residents within the last twelve (12) months. Please note that the categories and examples provided in the list below are those defined in the CCPA/CPRA. This does not mean that all examples of that category of personal information were in fact collected by Us, but reflects our good faith belief to the best of Our knowledge that some of that information from the applicable category may be and may have been collected. For example, certain categories of personal information would only be collected if You provided such personal information directly to Us.
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
                Category A: Identifiers. Examples: A real name, alias, postal address, unique personal identifier, online identifier, Internet Protocol address, email address, account name, driver's license number, passport number, or other similar identifiers. Collected: Yes.
              </li>
              <li>
                Category B: Personal information categories listed in the California Customer Records statute (Cal. Civ. Code § 1798.80(e)). Examples: A name, signature, Social Security number, physical characteristics or description, address, telephone number, passport number, driver's license or state identification card number, insurance policy number, education, employment, employment history, bank account number, credit card number, debit card number, or any other financial information, medical information, or health insurance information. Some personal information included in this category may overlap with other categories. Collected: Yes.
              </li>
              <li>
              Category C: Protected classification characteristics under California or federal law. Examples: Age (40 years or older), race, color, ancestry, national origin, citizenship, religion or creed, marital status, medical condition, physical or mental disability, sex (including gender, gender identity, gender expression, pregnancy or childbirth and related medical conditions), sexual orientation, veteran or military status, genetic information (including familial genetic information). Collected: No.
              </li>
              <li>
              Category D: Commercial information. Examples: Records and history of products or services purchased or considered. Collected: No.
              </li>
              <li>
              Category E: Biometric information. Examples: Genetic, physiological, behavioral, and biological characteristics, or activity patterns used to extract a template or other identifier or identifying information, such as, fingerprints, faceprints, and voiceprints, iris or retina scans, keystroke, gait, or other physical patterns, and sleep, health, or exercise data. Collected: No.
              </li>
              <li>
              Category F: Internet or other similar network activity. Examples: Interaction with our Service or advertisement. Collected: Yes.
              </li>
              <li>
              Category G: Geolocation data. Examples: Approximate physical location. Collected: No.
              </li>
              <li>
              Category H: Sensory data. Examples: Audio, electronic, visual, thermal, olfactory, or similar information. Collected: No.
              </li>
              <li>
              Category I: Professional or employment-related information. Examples: Current or past job history or performance evaluations. Collected: No.
              </li>
              <li>
              Category J: Non-public education information (per the Family Educational Rights and Privacy Act (20 U.S.C. Section 1232g, 34 C.F.R. Part 99)). Examples: Education records directly related to a student maintained by an educational institution or party acting on its behalf, such as grades, transcripts, class lists, student schedules, student identification codes, student financial information, or student disciplinary records. Collected: No.
              </li>
              <li>
              Category K: Inferences drawn from other personal information. Examples: Profile reflecting a person's preferences, characteristics, psychological trends, predispositions, behavior, attitudes, intelligence, abilities, and aptitudes. Collected: No.
              </li>
              <li>
              Category L: Sensitive personal information. Examples: Account login and password information, geolocation data. Collected: Yes.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
            Under CCPA/CPRA, personal information does not include:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              Publicly available information from government records
              </li>
              <li>
              Deidentified or aggregated consumer information
              </li>
              <li>
              Information excluded from the CCPA/CPRA's scope, such as: Health or medical information covered by the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and the California Confidentiality of Medical Information Act (CMIA) or clinical trial data Health or medical information covered by the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and the California Confidentiality of Medical Information Act (CMIA) or clinical trial data. Personal Information covered by certain sector-specific privacy laws, including the Fair Credit Reporting Act (FRCA), the Gramm-Leach-Bliley Act (GLBA) or California Financial Information Privacy Act (FIPA), and the Driver's Privacy Protection Act of 1994
              </li>
            </ul>
          </div>

          {/* Sources of Personal Information */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Sources of Personal Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We obtain the categories of personal information listed above from the following categories of sources:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              Directly from You. For example, from the forms You complete on our Service, preferences You express or provide through our Service.
              </li>
              <li>
              Indirectly from You. For example, from observing Your activity on our Service.
              </li>
              <li>
              Automatically from You. For example, through cookies We or our Service Providers set on Your Device as You navigate through our Service.
              </li>
              <li>
              From Service Providers. For example, third-party vendors to monitor and analyze the use of our Service, or other third-party vendors that We use to provide the Service to You.
              </li>
            </ul>
          </div>

          {/* Use of Personal Information */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Use of Personal Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We may use or disclose personal information We collect for "business purposes" or "commercial purposes" (as defined under the CCPA/CPRA), which may include the following examples:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              To operate our Service and provide You with Our Service.
              </li>
              <li>
              To provide You with support and to respond to Your inquiries, including to investigate and address Your concerns and monitor and improve our Service.
              </li>
              <li>
              To fulfill or meet the reason You provided the information. For example, if You share Your contact information to ask a question about our Service, We will use that personal information to respond to Your inquiry.
              </li>
              <li>
              To respond to law enforcement requests and as required by applicable law, court order, or governmental regulations.
              </li>
              <li>
              As described to You when collecting Your personal information or as otherwise set forth in the CCPA/CPRA.
              </li>
              <li>
              For internal administrative and auditing purposes.
              </li>
              <li>
              To detect security incidents and protect against malicious, deceptive, fraudulent or illegal activity, including, when necessary, to prosecute those responsible for such activities.
              </li>
              <li>
              Other one-time uses.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
            Please note that the examples provided above are illustrative and not intended to be exhaustive. For more details on how we use this information, please refer to the "Use of Your Personal Data" section. If We decide to collect additional categories of personal information or use the personal information We collected for materially different, unrelated, or incompatible purposes We will update this Privacy Policy.
            </p>
          </div>

          {/* Disclosure of Personal Information */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Disclosure of Personal Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We may use or disclose and may have used or disclosed in the last twelve (12) months the following categories of personal information for business or commercial purposes:
              <br />
              Category A: Identifiers
              <br />
              Category B: Personal information categories listed in the California Customer Records statute (Cal. Civ. Code § 1798.80(e))
              <br />
              Category F: Internet or other similar network activity
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            Please note that the categories listed above are those defined in the CCPA/CPRA. This does not mean that all examples of that category of personal information were in fact disclosed, but reflects our good faith belief to the best of our knowledge that some of that information from the applicable category may be and may have been disclosed. When We disclose personal information for a business purpose or a commercial purpose, We enter a contract that describes the purpose and requires the recipient to both keep that personal information confidential and not use it for any purpose except performing the contract.
            </p>
          </div>

          {/* Share of Personal Information */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Share of Personal Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We may share, and have shared in the last twelve (12) months, Your personal information identified in the above categories with the following categories of third parties:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              Service Providers
              </li>
              <li>
              Our affiliates
              </li>
              <li>
              Our business partners
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
            Third party vendors to whom you or your agents authorize us to disclose your personal information in connection with products or services we provide to you.
            </p>
          </div>

          {/* Sale of Personal Information of Minors Under 16 Years of Age */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Sale of Personal Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            As defined in the CCPA/CPRA, "sell" and "sale" mean selling, renting, releasing, disclosing, disseminating, making available, transferring, or otherwise communicating orally, in writing, or by electronic or other means, a Consumer's personal information by the Business to a third party for valuable consideration. This means that We may have received some kind of benefit in return for sharing personal information, but not necessarily a monetary benefit.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell personal information as the term sell is commonly understood. We do allow Service Providers to use Your personal information for the business purposes described in Our Privacy Policy, for activities such as advertising, marketing, and analytics, and these may be deemed a sale under CCPA/CPRA.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            We may sell and may have sold in the last twelve (12) months the following categories of personal information: Category A: Identifiers, Category B: Personal information categories listed in the California Customer Records statute (Cal. Civ. Code § 1798.80(e)), Category F: Internet or other similar network activity. Please note that the categories listed above are those defined in the CCPA/CPRA. This does not mean that all examples of that category of personal information were in fact sold, but reflects our good faith belief to the best of Our knowledge that some of that information from the applicable category may be and may have been shared for value in return.
            </p>
          </div>

          {/* Sale of Personal Information of Minors Under 16 Years of Age */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
            Sale of Personal Information of Minors Under 16 Years of Age
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell the personal information of Consumers We actually know are less than 16 years of age, unless We receive affirmative authorization (the "right to opt-in") from either the Consumer who is between 13 and 16 years of age, or the parent or guardian of a Consumer less than 13 years of age. Consumers who opt-in to the sale of personal information may opt-out of future sales at any time. To exercise the right to opt-out, You (or Your authorized representative) may submit a request to Us by contacting Us. If you have reason to believe that a child under the age of 13 (or 16) has provided Us with personal information, please contact Us with sufficient detail to enable Us to delete that information.
            </p>
            
          </div>
          
          {/* Your Rights under the CCPA/CPRA */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Your Rights under the CCPA/CPRA
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            The CCPA/CPRA provides California residents with specific rights regarding their personal information. If You are a resident of California, You have the following rights:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              The right to notice. You have the right to be notified which categories of Personal Data are being collected and the purposes for which the Personal Data is being used.
              </li>
              <li>
              The right to know/access. Under CCPA/CPRA, You have the right to request that We disclose information to You about Our collection, use, sale, disclosure for business purposes and share of personal information. Once We receive and confirm Your request, We will disclose to You: The categories of personal information We collected about You The categories of sources for the personal information. We collected about You Our business or commercial purposes for collecting or selling that personal information. The categories of third parties with whom. We share that personal information The specific pieces of personal information We collected about You If we sold Your personal information or disclosed Your personal information for a business purpose, We will disclose to You: The categories of personal information categories sold The categories of personal information categories disclosed.
              </li>
              <li>
              The right to say no to the sale or sharing of Personal Data (opt-out). You have the right to direct Us to not sell Your personal information. To submit an opt-out request, please see the "Do Not Sell My Personal Information" section or contact Us.
              </li>
              <li>
              The right to limit use and disclosure of sensitive Personal Data. You have the right to request to limit the use or disclosure of certain sensitive personal information We collected about You, unless an exception applies. To submit, please see the "Limit the Use or Disclosure of My Sensitive Personal Information" section or contact Us.
              </li>
              <li>
              The right to delete Personal Data. You have the right to request the deletion of Your Personal Data under certain circumstances, subject to certain exceptions. Once We receive and confirm Your request, We will delete (and direct Our Service Providers to delete) Your personal information from our records, unless an exception applies. We may deny Your deletion request if retaining the information is necessary for Us or Our Service Providers to: Complete the transaction for which We collected the personal information, provide a good or service that You requested, take actions reasonably anticipated within the context of our ongoing business relationship with You, or otherwise perform our contract with You. Detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity, or prosecute those responsible for such activities. Debug products to identify and repair errors that impair existing intended functionality. Exercise free speech, ensure the right of another consumer to exercise their free speech rights, or exercise another right provided for by law. Comply with the California Electronic Communications Privacy Act (Cal. Penal Code § 1546 et. seq.).Engage in public or peer-reviewed scientific, historical, or statistical research in the public interest that adheres to all other applicable ethics and privacy laws, when the information's deletion may likely render impossible or seriously impair the research's achievement, if You previously provided informed consent. Enable solely internal uses that are reasonably aligned with consumer expectations based on Your relationship with Us. Comply with a legal obligation. Make other internal and lawful uses of that information that are compatible with the context in which You provided it.
              </li>
              <li>
              The right not to be discriminated against. You have the right not to be discriminated against for exercising any of Your consumer's rights, including by: Denying goods or services to You Charging different prices or rates for goods or services, including the use of discounts or other benefits or imposing penalties Providing a different level or quality of goods or services to You Suggesting that You will receive a different price or rate for goods or services or a different level or quality of goods or services
              </li>
            </ul>
          </div>

          {/* Exercising Your CCPA/CPRA Data Protection Rights */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Exercising Your CCPA/CPRA Data Protection Rights
            </h2>
             <p className="text-gray-700 leading-relaxed mb-4">
            Please see the "Do Not Sell My Personal Information" section and "Limit the Use or Disclosure of My Sensitive Personal Information" section for more information on how to opt out and limit the use of sensitive information collected. Additionally, in order to exercise any of Your rights under the CCPA/CPRA, and if You are a California resident, You can contact Us: By email: info@wondrousdigital.com. Only You, or a person registered with the California Secretary of State that You authorize to act on Your behalf, may make a verifiable request related to Your personal information.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            Your request to Us must:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              Provide sufficient information that allows Us to reasonably verify You are the person about whom We collected personal information or an authorized representative
              </li>
              <li>
              Describe Your request with sufficient detail that allows Us to properly understand, evaluate, and respond to it
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
            We cannot respond to Your request or provide You with the required information if We cannot:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              Verify Your identity or authority to make the request
              </li>
              <li>
              And confirm that the personal information relates to you
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
            We will disclose and deliver the required information free of charge within 45 days of receiving Your verifiable request. The time period to provide the required information may be extended once by an additional 45 days when reasonably necessary and with prior notice. Any disclosures We provide will only cover the 12-month period preceding the verifiable request's receipt. For data portability requests, We will select a format to provide Your personal information that is readily usable and should allow You to transmit the information from one entity to another entity without hindrance.
            </p>
            
          </div>

          {/* Do Not Sell My Personal Information */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Do Not Sell My Personal Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            As defined in the CCPA/CPRA, "sell" and "sale" mean selling, renting, releasing, disclosing, disseminating, making available, transferring, or otherwise communicating orally, in writing, or by electronic or other means, a Consumer's personal information by the Business to a third party for valuable consideration. This means that We may have received some kind of benefit in return for sharing personal information, but not necessarily a monetary benefit.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell personal information as the term sell is commonly understood. We do allow Service Providers to use Your personal information for the business purposes described in Our Privacy Policy, for activities such as advertising, marketing, and analytics, and these may be deemed a sale under CCPA/CPRA.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            You have the right to opt-out of the sale of Your personal information. Once We receive and confirm a verifiable consumer request from You, we will stop selling Your personal information. To exercise Your right to opt-out, please contact Us.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            The Service Providers we partner with (for example, our analytics or advertising partners) may use technology on the Service that sells personal information as defined by the CCPA/CPRA law. If you wish to opt out of the use of Your personal information for interest-based advertising purposes and these potential sales as defined under CCPA/CPRA law, you may do so by following the instructions below.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            Please note that any opt out is specific to the browser You use. You may need to opt out on every browser that You use.
            </p>
            
          </div>

          {/* Website */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Website
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            If applicable, click "Privacy Preferences", "Update Privacy Preferences" or "Do Not Sell My Personal Information" buttons listed on the Service to review your privacy preferences and opt out of cookies and other technologies that We may use. Please note that You will need to opt out from each browser that You use to access the Service. Additionally, You can opt out of receiving ads that are personalized as served by our Service Providers by following our instructions presented on the Service: The NAI's opt-out platform: http://www.networkadvertising.org/choices/‍The EDAA's opt-out platform http://www.youronlinechoices.com/The DAA's opt-out platform: http://optout.aboutads.info/?c=2&lang=ENThe opt out will place a cookie on Your computer that is unique to the browser You use to opt out. If you change browsers or delete the cookies saved by your browser, You will need to opt out again.
            </p>
          </div>

          {/* Mobile Devices */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Mobile Devices
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            Your mobile device may give You the ability to opt out of the use of information about the apps You use in order to serve You ads that are targeted to Your interests:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              Opt out of Interest-Based Ads" or "Opt out of Ads Personalization" on Android devices
              </li>
              <li>
              "Limit Ad Tracking" on iOS devices
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
            You can also stop the collection of location information from Your mobile device by changing the preferences on Your mobile device.
            </p>
          </div>

          {/* Limit the Use or Disclosure of My Sensitive Personal Information */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Limit the Use or Disclosure of My Sensitive Personal Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            If You are a California resident, You have the right to limit the use and disclosure of Your sensitive personal information to that use which is necessary to perform the services or provide the goods reasonably expected by an average Consumer who requests such services or goods. We collect, use and disclose sensitive personal information in ways that are necessary to provide the Service. For more information on how We use Your personal information, please see the "Use of Your Personal Data" section or contact us.
            </p>
          </div>

          {/* "Do Not Track" Policy as Required by California Online Privacy Protection Act (CalOPPA) */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              "Do Not Track" Policy as Required by California Online Privacy Protection Act (CalOPPA)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            Our Service does not respond to Do Not Track signals. However, some third party websites do keep track of Your browsing activities. If You are visiting such websites, You can set Your preferences in Your web browser to inform websites that You do not want to be tracked. You can enable or disable DNT by visiting the preferences or settings page of Your web browser.
            </p>
          </div>

          {/* Your California Privacy Rights (California's Shine the Light law) */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Your California Privacy Rights (California's Shine the Light law)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            Under California Civil Code Section 1798 (California's Shine the Light law), California residents with an established business relationship with us can request information once a year about sharing their Personal Data with third parties for the third parties' direct marketing purposes. If you'd like to request more information under the California Shine the Light law, and if You are a California resident, You can contact Us using the contact information provided below.
            </p>
          </div>

          {/* California Privacy Rights for Minor Users (California Business and Professions Code Section 22581) */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              California Privacy Rights for Minor Users (California Business and Professions Code Section 22581)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            California Business and Professions Code Section 22581 allows California residents under the age of 18 who are registered users of online sites, services or applications to request and obtain removal of content or information they have publicly posted. To request removal of such data, and if You are a California resident, You can contact Us using the contact information provided below, and include the email address associated with Your account. Be aware that Your request does not guarantee complete or comprehensive removal of content or information posted online and that the law may not permit or require removal in certain circumstances.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            The Service may contain content appropriate for children under the age of 13. As a parent, you should know that through the Service children under the age of 13 may participate in activities that involve the collection or use of personal information. We use reasonable efforts to ensure that before we collect any personal information from a child, the child's parent receives notice of and consents to our personal information practices. We also may limit how We collect, use, and store some of the information of Users between 13 and 18 years old. In some cases, this means We will be unable to provide certain functionality of the Service to these Users. If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information. We may ask a User to verify its date of birth before collecting any personal information from them. If the User is under the age of 13, the Service will be either blocked or redirected to a parental consent process.
            </p>
          </div>

          {/* Information Collected from Children Under the Age of 13 */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Information Collected from Children Under the Age of 13
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            The Company may collect and store persistent identifiers such as cookies or IP addresses from Children without parental consent for the purpose of supporting the internal operation of the Service. We may collect and store other personal information about children if this information is submitted by a child with prior parent consent or by the parent or guardian of the child. The Company may collect and store the following types of personal information about a child when submitted by a child with prior parental consent or by the parent or guardian of the child:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              First and/or last name
              </li>
              <li>
              Date of birth
              </li>
              <li>
              Gender
              </li>
              <li>
              Email address
              </li>
              <li>
              Telephone number
              </li>
              <li>
              Parent's or guardian's name
              </li>
              <li>
              Parent's or guardian's email address
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
            For further details on the information We might collect, You can refer to the "Types of Data Collected" section of this Privacy Policy. We follow our standard Privacy Policy for the disclosure of personal information collected from and about children.
            </p>
          </div>

          {/* Parental Access */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Parental Access
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            A parent who has already given the Company permission to collect and use his child personal information can, at any time:
            </p>
            <ul className="custom-bullet-list mt-4 text-gray-700">
              <li>
              Review, correct or delete the child's personal information
              </li>
              <li>
              Discontinue further collection or use of the child's personal information
              </li>
            </ul>
          </div>

          {/* Links to Other Websites */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Links to Other Websites
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
            </p>
          </div>

          {/* Changes to this Privacy Policy */}
          <div className="mb-8">
          <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Changes to this Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page. We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-4" style={{ color: 'rgb(31, 10, 66)' }}>
              Contact Us
            </h2>
            <h3 className="font-semibold text-gray-900 mb-2">Personal Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Wondrous Digital is the digital agency branch of Wondrous Games, Inc., a Delaware C-Corporation. <br />
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> hello@wondrousdigital.com</p>
                <p className="text-gray-700"><strong>Website:</strong> <a href="https://wondrousdigital.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#F666AB' }} onMouseEnter={(e) => e.target.style.color = '#3E33C0'} onMouseLeave={(e) => e.target.style.color = '#F666AB'}>wondrousdigital.com</a> </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;