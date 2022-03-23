import json
import dateutil.parser
import time
import os
import math
import random
import logging
import re
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

""" --- Helpers to build responses which match the structure of the necessary dialog actions --- """

def delegate(session_attributes, slots):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Delegate',
            'slots': slots
        }
    }

""" --- Helper Functions --- """


def parse_int(n):
    try:
        return int(n)
    except ValueError:
        return float('nan')


def try_ex(func):
    """
    Call passed in function in try block. If KeyError is encountered return None.
    This function is intended to be used to safely access dictionary.

    Note that this function would have negative impact on performance.
    """

    try:
        return func()
    except KeyError:
        return None


""" --- Functions that control the bot's behavior --- """

def foramt_num(user_phone):
    pt1=user_phone[0:3]
    pt2=user_phone[3:6]
    pt3=user_phone[6:10]
    return('+1'+'-'+pt1+'-'+pt2+'-'+pt3)

def send_messages(user_phone, text2sms):
    pinpoint = boto3.client('pinpoint')
    tonumber = user_phone
    messages = text2sms
    response = pinpoint.send_messages(
        ApplicationId='<pinpoint-app-ID>',
        MessageRequest={
            'Addresses': {
                tonumber : {'ChannelType': 'SMS'}
            },
            'MessageConfiguration': {
                'SMSMessage': {
                    'Body': messages,
                    'MessageType': 'TRANSACTIONAL'
                }
            }
        }
    )
    return response['ResponseMetadata']['HTTPStatusCode']
    
def putItemInDDB(w_date,w_time,w_name, w_location, w_phone):
    table = dynamodb.Table('AppointmentsTable')
    
    put_response = table.put_item(
       Item={
            'date': w_date,
            'timeslot': w_time,
            'fname': w_name,
            'store': w_location,
            'phone': w_phone,
            'meeting': 'Scheduled',
            'notes': ''
        }
    )
    return (put_response ["ResponseMetadata"]["HTTPStatusCode"])
    
def close(session_attributes, fulfillment_state, message, user_phone, text2sms):
    send_messages(user_phone, text2sms)
    response = {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }
    print ("mynewresponse",response)
    return response

def make_appointment(intent_request):
    
    appointment_type = intent_request['currentIntent']['slots']['AppointmentType']
    date = intent_request['currentIntent']['slots']['Date']
    appointment_time = intent_request['currentIntent']['slots']['Time']
    user_name = intent_request['currentIntent']['slots']['Name']
    user_phone = intent_request['currentIntent']['slots']['Phone']
    # remove all non numeric characters and add + sign
    user_phone = '+' + re.sub('[^0-9]', '', user_phone)
    output_session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}
    text2sms = 'Appointment Notification: Hey {} appointment is confirmed for {}. See you there!'.format(user_name, appointment_time)
    putItemInDDB(date,appointment_time,user_name, 'Milano', user_phone)
    return close(
        output_session_attributes,
        'Fulfilled',
        {
            'contentType': 'PlainText',
            'content': 'Thanks {}, your appointment is confirmed for {}, and we have texted the details at your number'.format(user_name, appointment_time)
        },
        user_phone,
        text2sms
    )
    


""" --- Intents --- """


def dispatch(intent_request):
    """
    Called when the user specifies an intent for this bot.
    """

    logger.debug('dispatch userId={}, intentName={}'.format(intent_request['userId'], intent_request['currentIntent']['name']))

    intent_name = intent_request['currentIntent']['name']

    # Dispatch to your bot's intent handlers
    if intent_name == 'MakeAppointment':
        return make_appointment(intent_request)
    raise Exception('Intent with name ' + intent_name + ' not supported')


""" --- Main handler --- """


def lambda_handler(event, context):
    # By default, treat the user request as coming from the America/New_York time zone.
    os.environ['TZ'] = 'America/New_York'
    print('myevent',event)
    time.tzset()
    print(time.tzset())
    logger.debug('event.bot.name={}'.format(event['bot']['name']))
    
    return dispatch(event)
