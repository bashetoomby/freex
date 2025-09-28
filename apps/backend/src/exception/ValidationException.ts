import { HttpException, HttpStatus } from "@nestjs/common";

export class ValidationException extends HttpException {
    messages
    constructor(response) {
        super(response, HttpStatus.NOT_ACCEPTABLE)
        this.messages = response
    }
}