# Serverless Appointment Scheduler Amazon Connect

![Architecture Diagram](/ArchitectureDiagram.png)

In this post, we show you how to build a serverless, pay-as-you-go, self-service appontment scheduling solution with Amazon Lex and Amazon Connect. This solutions allows users to create appointments via Facebook Messenger and receive appointment confirmations through an SMS mobile message. It also provides you with a web-based dashboard where you can conveniently call users in one click at their scheduled time.
Solution overview

The solution consists of three primary components: the customer interaction using a messaging service, the scheduler and customer notification via SMS, and the customer outbound call.

For the customer interaction component, we use Amazon Lex. Amazon Lex is a fully managed artificial intelligence (AI) service with advanced natural language models to design, build, test, and deploy conversational interfaces in applications. Amazon Lex is configured in this use case via Facebook Messenger to receive messages from the customer and determine the customer intent. The Amazon Lex chatbot collects the required information for scheduling the appointment, such as date, time, and contact number.

For the scheduler and customer notification component, we use an AWS Lambda handler to process the scheduling request. The information collected is then saved to an Amazon DynamoDB database. When the information is saved successfully, a notification is sent out to the customer confirming the appointment details via SMS using Amazon Pinpoint.

For the customer outbound call component, a React.js application is created to display the saved customer appointments from the database in a calendar view format. This makes it easy for the employees to identify the customers who need to be reached. A call button from the calendar entry is clicked to initiate the call. This immediately places an outbound call request to connect the customer with the employee using Amazon Connect.


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.