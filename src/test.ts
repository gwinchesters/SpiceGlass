// // const definition = `definition george {}`
// // const definition2 = `
// // definition george {
// //   relation platform: Platform | Test#member
// //   relation platform: Platform | Test#member
// // }`
const main = `
// A user within an organization
definition user {
	relation platform: platform
	relation self: user

	permission write = platform->super_admin + self
}

// A machine user within an organization
definition machine_user {
	relation platform: platform
	relation owner: user

	permission write = platform->super_admin + owner
}

// A generic grouping of users
definition group {
	relation member: user | machine_user
}

// The top-level relation in the organization
definition platform {
	relation admin: user | machine_user | group#member
	permission super_admin = admin
}

// -- Top-Level Types

// A facility type
definition facility {
	relation platform: platform
	permission admin = platform->super_admin
}

// -- Nested Types (should have relation back to top-level)

// An optimization project
definition project {
	relation parent_facility: facility
	relation controller: user | machine_user

	permission write = parent_facility->admin
	permission control = write + controller
}

// A suggestion created for an optimization project
definition suggestion {
	relation parent_project: project

	permission write = parent_project->write
	permission control = parent_project->control
}

// A facility component
definition component {
	relation parent_facility: facility
	relation owner: user | machine_user

	permission write = parent_facility->admin + owner
}

// A control event
definition control_event {
	relation parent_component: component
	relation suggestion: suggestion

	permission write = parent_component->write + suggestion->control
}
`
import parseSchema from './schema/parser'

const schema = parseSchema(main)
console.log(JSON.stringify(schema, null, 2))

// // const operators: any = {
// // 	"&": { precedence: 1, associativity: "left" },
// // 	"+": { precedence: 2, associativity: "left" },
// // 	"-": { precedence: 2, associativity: "left" },
// // 	"->": { precedence: 3, associativity: "right" },
// // };

// // function parseExpression(expression: any) {
// //   const stack: any = [];
// //   let outputQueue = [];

// //   const tokens = expression.split(/(\+|\->|\-|\&|\(|\))/).map((token: any) => token.trim()).filter((token: any) => token !== '');

// //   for (let i = 0; i < tokens.length; i++) {
// //     const token = tokens[i];

// //     if (/^[a-zA-Z0-9_]+$/.test(token)) {
// //       // Operand
// //       outputQueue.push(token);
// //     } else if (token in operators) {
// //       // Operator
// //       const operator: any = operators[token];

// //       while (
// //         stack.length > 0 &&
// //         stack[stack.length - 1] in operators &&
// //         ((operator.associativity === "left" && operator.precedence <= operators[stack[stack.length - 1]].precedence) ||
// //           (operator.associativity === "right" && operator.precedence < operators[stack[stack.length - 1]].precedence))
// //       ) {
// //         outputQueue.push(stack.pop());
// //       }

// //       stack.push(token);
// //     } else if (token === "(") {
// //       // Left parenthesis
// //       stack.push(token);
// //     } else if (token === ")") {
// //       // Right parenthesis
// //       while (stack.length > 0 && stack[stack.length - 1] !== "(") {
// //         outputQueue.push(stack.pop());
// //       }
// //       if (stack.length === 0) {
// //         throw new Error("Mismatched parentheses");
// //       }
// //       stack.pop();
// //     } else {
// //       throw new Error("Invalid token: " + token);
// //     }
// //   }

// //   while (stack.length > 0) {
// //     if (stack[stack.length - 1] === "(" || stack[stack.length - 1] === ")") {
// //       throw new Error("Mismatched parentheses");
// //     }
// //     outputQueue.push(stack.pop());
// //   }

// //   return outputQueue;
// // }

// // function simplifyExpression(outputQueue: any) {
// // 	const newExpression: any = [];
// //   let lastTokenWasOperator = false;

// //   for (let i = 0; i < outputQueue.length; i++) {
// //     const token = outputQueue[i];

// //     if (/^[a-zA-Z0-9_]+$/.test(token)) {
// //       // Operand
// //       newExpression.push(token);
// //       lastTokenWasOperator = false;
// //     } else {
// //       // Operator
// //       const operator = operators[token];

// //       if (lastTokenWasOperator) {
// //         // If the last token was also an operator, we need to add parentheses to ensure the correct order of operations
// // 				const lastOperatorSymbol = newExpression.pop()
// //         const lastOperator = operators[lastOperatorSymbol];
// // 				const rightOperand = newExpression.pop()
// // 				const leftOperand = newExpression.pop()
// //         if (operator.precedence > lastOperator.precedence ||
// //             (operator.precedence === lastOperator.precedence && operator.associativity === "right")) {
// //           newExpression.push(`(${leftOperand} ${lastOperatorSymbol} ${rightOperand})`);
// //         } else {
// //           newExpression.push(`${leftOperand} ${lastOperatorSymbol} ${rightOperand}`);
// //         }
// //       } else {
// //         newExpression.push(token);
// //       }
// //       lastTokenWasOperator = true;
// //     }
// //   }

// //   return newExpression[0];
// // }

// // function simplifyExpression2(outputQueue: any) {
// //   const operators: any = {
// //     "&": { precedence: 1, associativity: "left" },
// //     "+": { precedence: 2, associativity: "left" },
// //     "-": { precedence: 2, associativity: "left" },
// //     "->": { precedence: 3, associativity: "right", omitParenthesis: true },
// //   };

// //   const newQueue: any = [];
// //   const stack: any = [];

// //   while (outputQueue.length > 0) {
// //     const token = outputQueue.shift();

// //     if (/^[a-zA-Z0-9_]+$/.test(token)) {
// //       // Operand
// //       newQueue.push(token);
// //     } else {
// //       // Operator
// //       const operator = operators[token];

// //       if (stack.length > 0 && stack[stack.length - 1] in operators) {
// //         const lastOperator = operators[stack[stack.length - 1]];

// //         if (lastOperator.precedence > operator.precedence ||
// //           (lastOperator.precedence === operator.precedence && lastOperator.associativity === "left")) {
// // 					const rightOperand = newQueue.pop()
// // 					const leftOperand = newQueue.pop()
// // 					const expression = `${leftOperand} ${stack.pop()} ${rightOperand}`
// // 					if (lastOperator.omitParenthesis) {
// // 						newQueue.push(`${expression}`);
// // 					} else {
// // 						newQueue.push(`(${expression})`);
// // 					}
// //         }
// //       }

// //       stack.push(token);
// //     }
// //   }

// //   while (stack.length > 0) {
// //     newQueue.push(`(${newQueue.pop()} ${stack.pop()} ${newQueue.pop()})`);
// //   }

// //   return newQueue[0];
// // }

// // function evaluateExpression(expression: any) {
// //   const stack: any = [];

// //   for (let i = 0; i < expression.length; i++) {
// //     const token = expression[i];

// //     if (/^[a-zA-Z0-9_]+$/.test(token)) {
// //       // Operand
// //       stack.push(token);
// //     } else {
// //       // Operator
// //       const b = stack.pop();
// //       const a = stack.pop();

// //       if (token === "&") {
// //         stack.push(`(${a} & ${b})`);
// //       } else if (token === "+") {
// //         stack.push(`(${a} + ${b})`);
// //       } else if (token === "-") {
// //         stack.push(`(${a} - ${b})`);
// //       } else if (token === "->") {
// //         stack.push(`(${a}->${b})`);
// //       }
// //     }
// //   }

// //   if (stack.length !== 1) {
// //     throw new Error("Invalid expression");
// //   }

// //   return stack[0];
// // }

// // function simplifyExpression3(outputQueue: any) {
// //   const operators: any = {
// //     "&": { precedence: 1, associativity: "left", symbol: "&" },
// //     "+": { precedence: 2, associativity: "left", symbol: "+" },
// //     "-": { precedence: 2, associativity: "left", symbol: "-" },
// //     "->": { precedence: 3, associativity: "right", symbol: "->" },
// //   };

// //   const newQueue: any = [];
// //   const stack: any = [];

// //   while (outputQueue.length > 0) {
// //     const token = outputQueue.shift();

// //     if (/^[a-zA-Z0-9_]+$/.test(token)) {
// //       // Operand
// //       newQueue.push(token);
// //     } else {
// //       // Operator
// //       const operator = operators[token];

// //       while (stack.length > 0 && stack[stack.length - 1] in operators) {
// //         const lastOperator = operators[stack[stack.length - 1]];

// //         if ((lastOperator.precedence > operator.precedence) ||
// //           (lastOperator.precedence === operator.precedence && lastOperator.associativity === "left")) {
// //           const operands = [];
// //           let currentOperand = newQueue.pop();

// //           // Pop all operands until the last operator of higher precedence is found
// //           while (currentOperand && currentOperand !== "(" && currentOperand !== ")") {
// //             operands.unshift(currentOperand);
// //             currentOperand = newQueue.pop();
// //           }

// //           // Add the current operator to the operands list
// //           operands.push(operator.symbol);

// //           // Pop the last operator from the stack and add it and the remaining operands to the new queue
// //           const lastOp = stack.pop();
// //           if (lastOp === "(" || lastOp === ")") {
// //             throw new Error("Mismatched parentheses");
// //           }

// //           let expr = `(${operands.pop()} ${lastOp} ${operands.pop()})`;

// //           while (operands.length > 0) {
// //             expr = `(${operands.pop()} ${lastOp} ${expr})`;
// //           }

// //           newQueue.push(expr);
// //         } else {
// //           break;
// //         }
// //       }

// //       stack.push(token);
// //     }
// //   }

// //   while (stack.length > 0) {
// //     const lastOp = stack.pop();
// //     if (lastOp === "(" || lastOp === ")") {
// //       throw new Error("Mismatched parentheses");
// //     }

// //     const operands = [];
// //     let currentOperand = newQueue.pop();

// //     // Pop all operands until the last operator is found
// //     while (currentOperand && currentOperand !== "(" && currentOperand !== ")") {
// //       operands.unshift(currentOperand);
// //       currentOperand = newQueue.pop();
// //     }

// //     // Add the last operator to the operands list
// //     operands.push(operators[lastOp].symbol);

// //     // Combine all the operands and operators into a single expression
// //     let expr = `(${operands.pop()} ${lastOp} ${operands.pop()})`;

// //     while (operands.length > 0) {
// //       expr = `(${operands.pop()} ${lastOp} ${expr})`;
// //     }

// //     newQueue.push(expr);
// //   }

// //   if (newQueue.length !== 1) {
// //     throw new Error("Invalid expression");
// //   }

// //   return newQueue[0];
// // }

// function parseExpression(expression: any) {
//   const operators: any = {
//     "+": { precedence: 1, associativity: "left" },
//     "-": { precedence: 1, associativity: "left" },
//     "&": { precedence: 2, associativity: "left" },
//     "->": { precedence: 3, associativity: "right" },
//   };

//   const outputQueue = [];
//   const operatorStack: any = [];

//   const tokens = expression.split(/(\->|\+|\-|\&|\(|\))/).filter((token: any) => token.trim() !== '');

//   for (let i = 0; i < tokens.length; i++) {
//     const token = tokens[i].trim();

//     if (/^[a-zA-Z0-9_]+$/.test(token)) {
//       // Operand
//       outputQueue.push(token);
//     } else if (token in operators) {
//       // Operator
//       const operator: any = operators[token];

//       while (
//         operatorStack.length > 0 &&
//         operatorStack[operatorStack.length - 1] in operators &&
//         ((operator.associativity === "left" && operator.precedence <= operators[operatorStack[operatorStack.length - 1]].precedence) ||
//           (operator.associativity === "right" && operator.precedence < operators[operatorStack[operatorStack.length - 1]].precedence))
//       ) {
//         outputQueue.push(operatorStack.pop());
//       }

//       operatorStack.push(token);
//     } else if (token === "(") {
//       // Left parenthesis
//       operatorStack.push(token);
//     } else if (token === ")") {
//       // Right parenthesis
//       while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== "(") {
//         outputQueue.push(operatorStack.pop());
//       }
//       if (operatorStack.length === 0) {
//         throw new Error("Mismatched parentheses");
//       }
//       operatorStack.pop();
//     } else {
//       throw new Error("Invalid token: " + token);
//     }
//   }

//   while (operatorStack.length > 0) {
//     if (operatorStack[operatorStack.length - 1] === "(" || operatorStack[operatorStack.length - 1] === ")") {
//       throw new Error("Mismatched parentheses");
//     }
//     outputQueue.push(operatorStack.pop());
//   }

//   return outputQueue;
// }

// function simplifyExpression(outputQueue: any) {
//   const operators: any = {
//     "+": "+",
//     "-": "-",
//     "&": "&",
//     "->": "->",
//   };

//   const stack: any = [];

//   for (let i = 0; i < outputQueue.length; i++) {
//     const token = outputQueue[i];

//     if (/^[a-zA-Z0-9_()]+$/g.test(token)) {
//       // Operand
//       stack.push(token);
//     } else {
//       // Operator
//       const operator: any = operators[token];

//       if (operator === "->") {
//         const rightOperand = stack.pop();
//         const leftOperand = stack.pop();

//         stack.push(`${leftOperand}${operator}${rightOperand}`);
//       } else {
//         const operands = [];

//         while (stack.length > 0 && !(stack[stack.length - 1] in operators)) {
//           operands.unshift(stack.pop());
//         }

//         let expr = operands.pop();

// 				while (operands.length > 0) {
//           const operand = operands.pop();
//           if (/^[+&-]$/.test(operator) && /^\(.+\)$/.test(expr) && /^\(.+\)$/.test(operand) && new RegExp(`^[^()+&-]*[${operator}]`).test(expr.slice(1, -1))) {
//             expr = `${operand} ${operator} ${expr}`;
//           } else {
//             expr = `(${removeOuterParens(operand)} ${operator} ${removeOuterParens(expr)})`;
//           }
//         }

//         stack.push(expr);
//       }
//     }
//   }

//   if (stack.length !== 1) {
//     throw new Error("Invalid expression");
//   }

//   return stack[0];
// }

// function removeOuterParens(expr: any) {
//   const stripped = expr.trim();

//   if (stripped.startsWith("(") && stripped.endsWith(")")) {
//     let parensCount = 0;

//     for (let i = 0; i < stripped.length; i++) {
//       if (stripped[i] === "(") {
//         parensCount++;
//       } else if (stripped[i] === ")") {
//         parensCount--;
//         if (parensCount === 0 && i < stripped.length - 1) {
//           // Parentheses don't encompass the whole expression, so we can't remove them
//           return expr;
//         }
//       }
//     }

//     return stripped.substring(1, stripped.length - 1);
//   }

//   return expr;
// }

// function simplifyExpressionMike(input: string[]) {
// 	const operators: any = {
//     "+": "+",
//     "-": "-",
//     "&": "&",
//     "->": "->",
//   };
// 	const stack: string[] = [];

// 	for (let i = 0; i < input.length; i++) {
// 		const token = input[i]
// 		if (/^[a-zA-Z0-9_()]+$/g.test(token)) {
// 			stack.push(token)
// 		} else {
// 			const operator: any = operators[token];
// 			if (operator === '->') {
// 				const rightOperand = stack.pop();
//         const leftOperand = stack.pop();

//         stack.push(`${leftOperand}${operator}${rightOperand}`);
// 			} else {
// 				const rightOperand = stack.pop()
// 				const leftOperand = stack.pop()

// 				stack.push(`(${leftOperand} ${operator} ${rightOperand})`)
// 			}
// 		}
// 	}

//   if (stack.length !== 1) {
//     throw new Error("Invalid expression");
//   }

//   return stack[0];
// }

// const queue = parseExpression('mike + (test_three & (test_two & test_three) & test_four->hello)')
// console.log(queue)
// // const result = evaluateExpression(queue)
// // console.log(result)
// const simplified = simplifyExpressionMike(queue)
// console.log(simplified)
