import boto3
from os import environ

def lambda_handler(event, context):
    
    print('## EVENT')
    print(event)

    client = boto3.client('connect')

    response = client.start_outbound_voice_contact(
        DestinationPhoneNumber = event['CustomerNumber'],
        ContactFlowId = '<outbound-call-contact-flow-ID>',
        InstanceId = '<connect-instance-ID>',
        QueueId = '<outbound-queue-ID>',
        Attributes = {
            'first_name': event['FirstName']
        }
    )

    return response