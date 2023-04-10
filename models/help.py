import torch 

def accuracy_fn(y_pred, y_true):
    correct = torch.eq(y_true, y_pred).sum().item()
    acc = (correct / len(y_pred)) * 100
    return acc

def train_step(model: torch.nn.Module,
               dataloader: torch.utils.data.DataLoader,
               loss_fn: torch.nn.Module,
               optim: torch.optim,
               device: torch.device,
               print_output:bool=True):
    model.train()
    train_loss, train_acc = 0, 0

    for (X, y) in dataloader :#tqdm inside enumrater
        X, y = X.to(device), y.to(device)
        y_pred = model(X)

        loss = loss_fn(y_pred, y)
        train_acc += accuracy_fn(y_pred.argmax(dim=1), y)
        train_loss += loss

        optim.zero_grad()

        loss.backward()

        optim.step()

    train_acc /= len(dataloader)
    train_loss /= len(dataloader)

    if print_output: print(f"train: {train_loss}, {train_acc}%")  
    return [train_loss.item(), train_acc]

def test_step(model: torch.nn.Module,
               dataloader: torch.utils.data.DataLoader,
               loss_fn: torch.nn.Module,
               device: torch.device,
               print_output:bool=True):
    ##Testing
    test_loss, test_acc = 0, 0

    model.eval()
    with torch.inference_mode():
        for X, y in dataloader:
            X, y = X.to(device), y.to(device)
            test_pred = model(X)
            test_loss += loss_fn(test_pred, y) # accumulatively add up the loss per epoch
            # 3. Calculate accuracy (preds need to be same as y_true)
            test_acc += accuracy_fn(test_pred.argmax(dim=1), y)
    
        test_loss /= len(dataloader)
        test_acc /= len(dataloader)
    if print_output: print(f"test: {test_loss}, {test_acc}%")
    return test_acc


def train_test(model: torch.nn.Module,
               train_dataloader: torch.utils.data.DataLoader,
               test_dataloader: torch.utils.data.DataLoader,
               loss_fn: torch.nn.Module,
               optim: torch.optim,
               device: torch.device,
               epochs:int=10,
               print_output:bool=True):
    eval = [] #Train loss, Test acc, Test lost, test acc

    for epoch in range(epochs):
        eval = [] 

        if print_output: print(f"Epoch {epoch}\n--------")
        eval.append( train_step(model, train_dataloader,
            loss_fn,
            optim,
            device,
            print_output))

        eval.append( test_step(model, test_dataloader,
            loss_fn,
            device,
            print_output))
    return eval
