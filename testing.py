import util,os

with open(os.path.join(util.root,'todo.txt'),'r') as f:
    data=f.read()

def test(x):
    try:
        int(x.rsplit('-',maxsplit=1)[1])
        return False
    except:
        return True

print('\n'.join(sorted(set(filter(test,data.split('\n'))))))