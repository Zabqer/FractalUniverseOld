import ast
import operator

binops = {
    ast.Add: operator.add,
    ast.Mult: operator.mul,
    ast.Pow: operator.pow,
    ast.Sub: operator.sub,
    ast.Div: operator.truediv
}

unops = {
    ast.USub: operator.neg,
}

calls = {
    "abs": abs
}

def compile(formula):
    def wrapped(**vars):
        def _eval(expression):
            if isinstance(expression, ast.BinOp):
                return binops[type(expression.op)](_eval(expression.left), _eval(expression.right))
            elif isinstance(expression, ast.UnaryOp):
                return unops[type(expression.op)](_eval(expression.operand))
            elif isinstance(expression, ast.Num):
                return expression.n
            elif isinstance(expression, ast.Name):
                return vars[expression.id]
            elif isinstance(expression, ast.Call):
                return calls[expression.func.id](*[_eval(arg) for arg in expression.args])
            else:
                raise ValueError("unknown action " + str(ast.dump(expression)))

        return _eval(expression)
    expression = ast.parse(formula, mode="eval").body
    return wrapped
