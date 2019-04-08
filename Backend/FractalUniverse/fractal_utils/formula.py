import ast
import operator

binops = {
    ast.Add: operator.add,
    ast.Mult: operator.mul,
    ast.Pow: operator.pow
}

unops = {
    ast.USub: operator.neg,
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
            else:
                raise ValueError("unknown action " + str(ast.dump(expression)))

        return _eval(expression)
    expression = ast.parse(formula, mode="eval").body
    return wrapped
