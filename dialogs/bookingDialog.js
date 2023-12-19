// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class BookingDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'bookingDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.destinationStep.bind(this),
                this.originStep.bind(this),
                this.originStep.bind(this),
                this.originStep.bind(this),
                this.originStep.bind(this),
                this.originStep.bind(this),
                this.originStep.bind(this),
                this.originStep.bind(this),
                // this.travelDateStep.bind(this),
                // this.confirmStep.bind(this),
                // this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If a destination city has not been provided, prompt for one.
     */
    async destinationStep(stepContext) {
        const bookingDetails = stepContext.options;


        // if(bookingDetails.destination === 'teraz'){
        //     const messageText = '2222';
        // }
        // else if (true){
        //     const messageText = 'bad req';
        // }




        if (!bookingDetails.destination) {
            const messageText = 'hey how can i help you';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }

        return await stepContext.next(bookingDetails.destination);
    }

    
    /**
     * If an origin city has not been provided, prompt for one.
     */
    async originStep(stepContext) {
        const bookingDetails = stepContext.options;


        

        // Capture the response to the previous step's prompt
        bookingDetails.destination = stepContext.result;
        var messageText = 'a'
        if(bookingDetails.destination === 'Hi Assistant, can you prepare some questions for a retrospective?'){
             messageText = 'Yes, I can. Here you are:\n\n1) The US34345 plan estimate was 10 pts. The final implementation consumed 13 pts. What was the reason of underestimation?\n\n2) The busiest person in the current sprint was Pawel. He burned 20 pts. Whereas Daniel and Christina burned only 5 pts. What was the reason that the workload was not distributed evenly?\n\n3) There are still two User Stories unfinished (US35345, US 53232) in current iteration. What are the reasons that the user stories couldn’t be finished?\n\n4) There is significant higher number of defects in current iteration: 4 (2 on average). What was the reason of the increase.';



        }
        else{
             messageText = 'bad req';
        }
        if (!bookingDetails.origin) {
            


            // const sleep = ms => new Promise(r => setTimeout(r, ms));
            const p1=new Promise((res)=>setTimeout(()=>res("p1"),10000));

            stepContext.prompt(TEXT_PROMPT, { prompt: 'aaaaaaaaa' });
            await p1;

            const msg = MessageFactory.text(messageText, 'From what city will you be travelling?', InputHints.ExpectingInput);

            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.origin);
    }

    /**
     * If a travel date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    async travelDateStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.origin = stepContext.result;
        if (!bookingDetails.travelDate || this.isAmbiguous(bookingDetails.travelDate)) {
            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: bookingDetails.travelDate });
        }
        return await stepContext.next(bookingDetails.travelDate);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.travelDate = stepContext.result;
        const messageText = `Please confirm, I have you traveling to: ${ bookingDetails.destination } from: ${ bookingDetails.origin } on: ${ bookingDetails.travelDate }. Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const bookingDetails = stepContext.options;
            return await stepContext.endDialog(bookingDetails);
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.BookingDialog = BookingDialog;
