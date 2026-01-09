desume flow

user initialises
user enters details. (name, contact, expeicence education, GitHub, etc)
user enters a resume they want to use as a template.

- github-management
  we collect GitHub projects based on the GitHub link provided.
  we append that to the profile data that would be used for later.

- profile-management
  we use inquirer.js to receive individual elements of the profile information. we also have functions in place so that when the user wants to use the raw cli to actually update something they can do so using the actual fields of the json.

- template-management
  we prepare the available resume data
  we receive the collected template (Which is a full resume)
  we check what the user wants (hifi or lofi... basically how much error or deviation from the actual resume uploaded)
  we then convert the docx resume into html.

lofi
we then send the resume.html + the resume data to an llm to convert it into a template with placeholders using the available fields within the resumedata
we return the template.html to the user to store for any future resume needs.

hifi
we convert the resume to an image... a screenshot of the page.
we send the screenshot, the html and the resumedata to an llm to first restructure the html into the format that the screenshot provides. then convert that html into a template with placeholders
we send the template.html to the user back

we store this template.html from either processes for future resume needs

- job-management
  we receive the job description from the user as raw text, as an image, or even as a link to an html page (these are th emost popular job formats i could find)
  we send the text acquired from the job description + the resumedata schema to an llm which then returns a json containing the filled out resumedata.

- resume-management
  we receive the resumedata that we can actually use from the llm
  we then populate our template.html depending on the template we are working with
  we send the html to the user.
  we allow the user to receive the template, as raw html (highly unlikely, pdf or docx.)

====

- cli-management
  incomplete

- template-management:hifi
  incomplete

- resume-management
  incomplete

- history-management.
  undiscovered
